"""Handwritten Text Recognition Neural Network"""

import os
import datetime
import logging
try:
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = "3"
    logging.disable(logging.WARNING)
except AttributeError:
    pass

import numpy as np
import tensorflow as tf

from contextlib import redirect_stdout
from tensorflow.keras import backend as keras_backend
from tensorflow.keras import Model

from tensorflow.keras.callbacks import CSVLogger, TensorBoard, ModelCheckpoint
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.constraints import MaxNorm

from tensorflow.keras.layers import Bidirectional, LSTM, Dense, Conv2D, Multiply, Activation
from tensorflow.keras.layers import Dropout, BatchNormalization, PReLU
from tensorflow.keras.layers import Input, MaxPooling2D, Reshape


class HTRModel:
    """
    HTRModel Class based on:
        Y. Soullard, C. Ruffino and T. Paquet,
        CTCModel: A Connectionnist Temporal Classification implementation for Keras.
        ee: https://arxiv.org/abs/1901.07957, 2019.
        github: https://github.com/ysoullard/HTRModel

    The HTRModel class use Tensorflow 2 Keras module for the use of the
    Connectionist Temporal Classification (CTC) with the Hadwritten Text Recognition (HTR).

    In a Tensorflow Keras Model, x is the input features and y the labels.
    """

    def __init__(self,
                 input_size,
                 vocabulary_size,
                 greedy=False,
                 beam_width=10,
                 top_paths=1,
                 stop_tolerance=20,
                 reduce_tolerance=15,
                 cooldown=0):
        """
        Initialization of a HTR Model.

        :param
            greedy, beam_width, top_paths: Parameters of the CTC decoding
            (see ctc decoding tensorflow for more details)
        """

        self.input_size = input_size
        self.vocabulary_size = vocabulary_size

        self.model = None
        self.greedy = greedy
        self.beam_width = beam_width
        self.top_paths = max(1, top_paths)

        self.stop_tolerance = stop_tolerance
        self.reduce_tolerance = reduce_tolerance
        self.cooldown = cooldown

    def summary(self, output=None, target=None):
        """Show/Save model structure (summary)"""

        self.model.summary()

        if target is not None:
            os.makedirs(output, exist_ok=True)

            with open(os.path.join(output, target), "w") as f:
                with redirect_stdout(f):
                    self.model.summary()

    def load_checkpoint(self, target):
        """ Load a model with checkpoint file"""

        if os.path.isfile(target):
            if self.model is None:
                self.compile()

            self.model.load_weights(target)

    def get_callbacks(self, logdir, checkpoint, monitor="val_loss", verbose=0):
        """Setup the list of callbacks for the model"""

        callbacks = [
            CSVLogger(
                filename=os.path.join(logdir, "epochs.log"),
                separator=";",
                append=True),
            TensorBoard(
                log_dir=logdir,
                histogram_freq=10,
                profile_batch=0,
                write_graph=True,
                write_images=False,
                update_freq="epoch"),
            ModelCheckpoint(
                filepath=checkpoint,
                monitor=monitor,
                save_best_only=True,
                save_weights_only=True,
                verbose=verbose),
            EarlyStopping(
                monitor=monitor,
                min_delta=1e-8,
                patience=self.stop_tolerance,
                restore_best_weights=True,
                verbose=verbose),
            ReduceLROnPlateau(
                monitor=monitor,
                min_delta=1e-8,
                factor=0.2,
                patience=self.reduce_tolerance,
                cooldown=self.cooldown,
                verbose=verbose)
        ]

        return callbacks

    def flor_architecture(self, input_size, d_model):
        """
        Gated Convolutional Recurrent Neural Network by Flor et al.
        """

        input_data = Input(name="input", shape=input_size)

        cnn = Conv2D(filters=32, kernel_size=(3, 3), strides=(1, 2), padding="same", kernel_initializer="he_uniform")(input_data)
        cnn = PReLU(shared_axes=[1, 2])(cnn)
        cnn = BatchNormalization(renorm=True)(cnn)
        cnn = FullGatedConv2D(filters=32, kernel_size=(3, 3), padding="same")(cnn)
        cnn = Conv2D(filters=64, kernel_size=(3, 3), strides=(1, 1), padding="same", kernel_initializer="he_uniform")(cnn)
        cnn = PReLU(shared_axes=[1, 2])(cnn)
        cnn = BatchNormalization(renorm=True)(cnn)
        cnn = FullGatedConv2D(filters=64, kernel_size=(3, 3), padding="same")(cnn)
        cnn = Conv2D(filters=128, kernel_size=(2, 4), strides=(2, 4), padding="same", kernel_initializer="he_uniform")(cnn)
        cnn = PReLU(shared_axes=[1, 2])(cnn)
        cnn = BatchNormalization(renorm=True)(cnn)
        cnn = FullGatedConv2D(filters=128, kernel_size=(3, 3), padding="same", kernel_constraint=MaxNorm(4, [0, 1, 2]))(cnn)
        cnn = Dropout(rate=0.2)(cnn)
        cnn = Conv2D(filters=256, kernel_size=(3, 3), strides=(1, 1), padding="same", kernel_initializer="he_uniform")(cnn)
        cnn = PReLU(shared_axes=[1, 2])(cnn)
        cnn = BatchNormalization(renorm=True)(cnn)
        cnn = FullGatedConv2D(filters=256, kernel_size=(3, 3), padding="same", kernel_constraint=MaxNorm(4, [0, 1, 2]))(cnn)
        cnn = Dropout(rate=0.2)(cnn)
        cnn = Conv2D(filters=256, kernel_size=(2, 4), strides=(2, 4), padding="same", kernel_initializer="he_uniform")(cnn)
        cnn = PReLU(shared_axes=[1, 2])(cnn)
        cnn = BatchNormalization(renorm=True)(cnn)
        cnn = FullGatedConv2D(filters=256, kernel_size=(3, 3), padding="same", kernel_constraint=MaxNorm(4, [0, 1, 2]))(cnn)
        cnn = Dropout(rate=0.2)(cnn)
        cnn = Conv2D(filters=512, kernel_size=(3, 3), strides=(1, 1), padding="same", kernel_initializer="he_uniform")(cnn)
        cnn = PReLU(shared_axes=[1, 2])(cnn)
        cnn = BatchNormalization(renorm=True)(cnn)

        cnn = MaxPooling2D(pool_size=(1, 2), strides=(1, 2), padding="valid")(cnn)

        shape = cnn.get_shape()
        bgru = Reshape((shape[1] * 2, -1))(cnn)
        rnn_size = 128
        bgru = Bidirectional(LSTM(units=rnn_size, return_sequences=True, dropout=0.1))(bgru)
        bgru = Dense(units=256)(bgru)

        bgru = Bidirectional(LSTM(units=rnn_size, return_sequences=True, dropout=0.3))(bgru)
        output_data = Dense(units=d_model, activation="softmax")(bgru)

        return input_data, output_data

    def compile(self, learning_rate=None, initial_step=0):
        """
        Configures the HTR Model for training/predict.
        """

        # define inputs and outputs based on the flor architecture
        inputs, outputs = self.flor_architecture(self.input_size, self.vocabulary_size + 1)

        # define the schedule for the Learning Rate
        if learning_rate is None:
            learning_rate = CustomSchedule(d_model=self.vocabulary_size + 1, initial_step=initial_step)
            self.learning_schedule = True
        else:
            self.learning_schedule = False

        # define the optimizer based on the defined Learning Rate
        optimizer = tf.keras.optimizers.RMSprop(learning_rate=learning_rate)

        # create and compile
        self.model = Model(inputs=inputs, outputs=outputs)
        self.model.compile(optimizer=optimizer, loss=self.ctc_loss_lambda_func)

    def fit(self,
            x=None,
            y=None,
            batch_size=None,
            epochs=1,
            verbose=1,
            callbacks=None,
            validation_split=0.0,
            validation_data=None,
            shuffle=True,
            class_weight=None,
            sample_weight=None,
            initial_epoch=0,
            steps_per_epoch=None,
            validation_steps=None,
            validation_freq=1,
            max_queue_size=10,
            workers=1,
            use_multiprocessing=False,
            **kwargs):
        """
        Model training on data yielded (fit function has support to generator).
        A fit() abstration function of TensorFlow 2.

        Provide x parameter of the form: yielding (x, y, sample_weight).

        :param: See tensorflow.keras.Model.fit()
        :return: A history object
        """

        # remove ReduceLROnPlateau (if exist) when use schedule learning rate
        if callbacks and self.learning_schedule:
            callbacks = [x for x in callbacks if not isinstance(x, ReduceLROnPlateau)]

        out = self.model.fit(x=x, y=y, batch_size=batch_size, epochs=epochs, verbose=verbose,
                             callbacks=callbacks, validation_split=validation_split,
                             validation_data=validation_data, shuffle=shuffle,
                             class_weight=class_weight, sample_weight=sample_weight,
                             initial_epoch=initial_epoch, steps_per_epoch=steps_per_epoch,
                             validation_steps=validation_steps, validation_freq=validation_freq,
                             max_queue_size=max_queue_size, workers=workers,
                             use_multiprocessing=use_multiprocessing, **kwargs)
        return out

    def predict(self,
                x,
                batch_size=None,
                verbose=0,
                steps=1,
                callbacks=None,
                max_queue_size=10,
                workers=1,
                use_multiprocessing=False,
                ctc_decode=True,
                ):
        """
        Model predicting on data yielded (predict function has support to generator).
        A predict() abstration function of TensorFlow 2.

        Provide x parameter of the form: yielding [x].

        :param: See tensorflow.keras.Model.predict()
        :return: raw data on `ctc_decode=False` or CTC decode on `ctc_decode=True` (both with probabilities)
        """

        if verbose == 1:
            print("Model Predict")

        predict_time_start = datetime.datetime.now()
        out = self.model.predict(x=x, batch_size=batch_size, verbose=verbose, steps=steps,
                                 callbacks=callbacks, max_queue_size=max_queue_size,
                                 workers=workers, use_multiprocessing=use_multiprocessing)
        predict_time_end = datetime.datetime.now()
        print('predict time', predict_time_end - predict_time_start)

        if not ctc_decode:
            return np.log(out.clip(min=1e-8)), []

        if verbose == 1:
            print("CTC Decode")
            progbar = tf.keras.utils.Progbar(target=steps)

        start_time = datetime.datetime.now()
        predicts, probabilities = self.ctc_decode_tf(out)
        end_time = datetime.datetime.now()
        print('CTC Decode time', end_time - start_time)

        return predicts, probabilities

    @staticmethod
    def ctc_loss_lambda_func(y_true, y_pred):
        """Function for computing the CTC loss"""

        if len(y_true.shape) > 2:
            y_true = tf.squeeze(y_true)

        # y_pred.shape = (batch_size, string_length, alphabet_size_1_hot_encoded)
        # output of every model is softmax
        # so sum across alphabet_size_1_hot_encoded give 1
        #               string_length give string length
        input_length = tf.math.reduce_sum(y_pred, axis=-1, keepdims=False)
        input_length = tf.math.reduce_sum(input_length, axis=-1, keepdims=True)

        # y_true strings are padded with 0
        # so sum of non-zero gives number of characters in this string
        label_length = tf.math.count_nonzero(y_true, axis=-1, keepdims=True, dtype="int64")

        loss = keras_backend.ctc_batch_cost(y_true, y_pred, input_length, label_length)

        # average loss across all entries in the batch
        loss = tf.reduce_mean(loss)

        return loss

    @staticmethod
    def ctc_decode_tf(y_pred):
        """Decodes the output of a softmax.
        """
        y_pred = np.log(y_pred)
        input_shape = tf.shape(y_pred)
        sequence_length = tf.fill([input_shape[0]], input_shape[1])
        decoded, neg_sum_logits = tf.nn.ctc_beam_search_decoder(tf.transpose(y_pred, perm=[1, 0, 2]),
                                                                sequence_length, 10)

        return decoded, neg_sum_logits


class CustomSchedule(tf.keras.optimizers.schedules.LearningRateSchedule):
    """
    Custom schedule of the learning rate with warmup_steps.

    Reference:
        Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser and Polosukhin.
        "Attention Is All You Need", 2017 arXiv, URL: https://arxiv.org/abs/1706.03762
    """

    def __init__(self, d_model, initial_step=0, warmup_steps=4000):
        super(CustomSchedule, self).__init__()

        self.d_model = d_model
        self.d_model = tf.cast(self.d_model, dtype="float32")
        self.initial_step = initial_step
        self.warmup_steps = warmup_steps

    def __call__(self, step):
        arg1 = tf.math.rsqrt(step + self.initial_step)
        arg2 = step * (self.warmup_steps**-1.5)

        return tf.math.rsqrt(self.d_model) * tf.math.minimum(arg1, arg2)


class FullGatedConv2D(Conv2D):
    """
    Tensorflow Keras layer implementation of the gated convolution.
    Introduce a Conv2D to extract features (linear and sigmoid), making a full gated process.
    This process will double number of filters to make one convolutional process.

        Reference (based):
            Y. N. Dauphin, A. Fan, M. Auli, and D. Grangier,
            Language modeling with gated convolutional networks, in ICML 2017

            A. van den Oord and N. Kalchbrenner and O. Vinyals and L. Espeholt and A. Graves and K. Kavukcuoglu
            Conditional Image Generation with PixelCNN Decoders, in NIPS 2016
    """

    def __init__(self, filters, **kwargs):
        """
        :param filters: The number of output filters as an int.
        :param kwargs: Other Conv2D keyword arguments.

        """
        super(FullGatedConv2D, self).__init__(filters=filters * 2, **kwargs)
        self.nb_filters = filters

    def call(self, inputs):
        """Apply gated convolution"""

        output = super(FullGatedConv2D, self).call(inputs)
        linear = Activation("linear")(output[:, :, :, :self.nb_filters])
        sigmoid = Activation("sigmoid")(output[:, :, :, self.nb_filters:])

        return Multiply()([linear, sigmoid])

    def compute_output_shape(self, input_shape):
        """Compute shape of layer output"""

        output_shape = super(FullGatedConv2D, self).compute_output_shape(input_shape)
        return tuple(output_shape[:3]) + (self.nb_filters * 2,)

    def get_config(self):
        """Return the config of the layer"""

        config = super(FullGatedConv2D, self).get_config()
        config['nb_filters'] = self.nb_filters
        del config['filters']
        return config