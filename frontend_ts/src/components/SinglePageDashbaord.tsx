import { useState } from "react";

import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";

import ImageCanvas from "./ImageCanvas";
import DocumentUploadForm from "./DocumentUploadForm";
import DocumentStatus from "./DocumentStatus";
import {
  TextDetectionResponseData,
  BoundingBox,
} from "../models/textDetection";
import { KonvaEventObject } from "konva/lib/Node";

function SinglePageDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageFileData, setImageFileData] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageFile, setImageFile] = useState(new Blob());

  const [textDetectionResponse, setTextDetectionResponde] = useState<
    TextDetectionResponseData | undefined
  >(undefined);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const dragEndHandler = (e: KonvaEventObject<DragEvent>) => {
    setBoundingBoxes((previousState) => {
      const newState = [...previousState].map((box) => {
        if (box.id === e.target.id()) {
          return new BoundingBox(
            box.id,
            box.height,
            box.width,
            e.target.x(),
            e.target.y()
          );
        } else {
          return box;
        }
      });
      return newState;
    });
  };

  const imageUploadHandler = (event: any) => {
    event.preventDefault();
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onloadend = (ev) => {
      if (ev.target?.result) {
        setIsImageLoaded(true);
        setImageFileName(file.name);
        setImageFileData(ev.target.result.toString());
        setImageFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const startSegmentationHandler = async () => {
    setIsLoading(true);

    try {
      const textDetectionURL = `http://${process.env.REACT_APP_TEXT_DETECTOR_SERVICE_URL}/image/`;
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(textDetectionURL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`the http request returned:${response.status}`);
      }

      const data = await response.json();
      const boxesData = TextDetectionResponseData.fromJson(data);
      if (boxesData) {
        setTextDetectionResponde(boxesData);
        setBoundingBoxes(boxesData.boundingBoxes);
      } else {
        throw new Error("The Response data follows an unexpected schema");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        setShowModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{error?.message}</Modal.Body>
      </Modal>

      <Container fluid className="p-3 bg-secondary text-white">
        {!isImageLoaded && <DocumentUploadForm onUpload={imageUploadHandler} />}
        {isImageLoaded && (
          <DocumentStatus
            imageName={imageFileName}
            isLoading={isLoading}
            onSegmentationClick={startSegmentationHandler}
            segmentationData={boundingBoxes}
          />
        )}
      </Container>
      {isImageLoaded && (
        <Stack direction="horizontal">
          <ImageCanvas
            imageSrc={imageFileData}
            boundingBoxes={boundingBoxes}
            dragEndHandler={dragEndHandler}
          />
        </Stack>
      )}
    </>
  );
}

export default SinglePageDashboard;
