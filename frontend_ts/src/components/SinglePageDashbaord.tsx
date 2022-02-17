import { useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";

import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";

import ErrorModal from "./ErrorModal";
import ImageCanvas from "./ImageCanvas";
import DocumentUploadForm from "./DocumentUploadForm";
import DocumentStatus from "./DocumentStatus";
import AnnotationList from "./AnnotationList";
import {
  TextDetectionResponseData,
  BoundingBox,
} from "../models/textDetection";

function SinglePageDashboard() {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<Error | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageFile, setImageFile] = useState(new Blob());
  const [imageElem, setImageElem] = useState<HTMLImageElement | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    name: string;
    width: number;
    height: number;
  } | null>(null);

  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);

  const [ocrServiceResponse, setOcrServiceResponse] = useState<string[]>([]);

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

  const imageUploadHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const img = new Image();
          img.src = ev.target.result.toString();

          img.onload = () => {
            setImageFile(file);
            setImageInfo({
              name: file.name,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
            setImageElem(img);

            setIsImageLoaded(true);
          };
        }
      };

      reader.readAsDataURL(file);
    }
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

  const sendToOCRHandler = async () => {
    setIsLoading(true);

    try {
      const ocrServiceURL = `http://${process.env.REACT_APP_OCR_SERVICE_URL}/ocr`;

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("boxes", JSON.stringify(boundingBoxes));

      const response = await fetch(ocrServiceURL, {
        method: "POST",
        body: formData,
        headers: {
          mode: "no-cors",
        },
      });

      if (!response.ok) {
        throw new Error(`the http request returned:${response.status}`);
      }

      const data = await response.json();
      setOcrServiceResponse(data.predictions);
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
      <ErrorModal show={showModal} error={error} onHide={handleCloseModal} />

      <Container fluid>
        {!isImageLoaded && (
          <Row className="mt-5 justify-content-center">
            <DocumentUploadForm onUpload={imageUploadHandler} />
          </Row>
        )}

        {isImageLoaded && imageInfo && (
          <Row className="bg-secondary text-white">
            <DocumentStatus
              imageName={imageInfo.name}
              isLoading={isLoading}
              onSegmentationClick={startSegmentationHandler}
              onSendToOcrClick={sendToOCRHandler}
              segmentationData={boundingBoxes}
            />
          </Row>
        )}

        {isImageLoaded && imageElem && imageInfo && (
          <Row>
            <Col className="justify-content-center">
              <ImageCanvas
                imageSrc={imageElem}
                imageWidth={imageInfo.width}
                imageHeight={imageInfo.height}
                boundingBoxes={boundingBoxes}
                setBoundingBoxes={setBoundingBoxes}
                dragEndHandler={dragEndHandler}
              />
            </Col>
            <Col className="justify-content-center">
              {ocrServiceResponse.length === 0 && (
                <p>Click "send to OCR" to start the prediction</p>
              )}
              {ocrServiceResponse.length > 0 && (
                <AnnotationList
                  annotations={ocrServiceResponse}
                  listMaxheight={imageInfo.height}
                />
              )}
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}

export default SinglePageDashboard;
