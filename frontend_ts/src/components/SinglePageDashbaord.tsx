import { useState } from "react";

import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";

import { KonvaEventObject } from "konva/lib/Node";

import ImageCanvas from "./ImageCanvas";
import DocumentUploadForm from "./DocumentUploadForm";
import DocumentStatus from "./DocumentStatus";
import AnnotationList from "./AnnotationList";
import {
  TextDetectionResponseData,
  BoundingBox,
} from "../models/textDetection";
import { Col, Row } from "react-bootstrap";

function SinglePageDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageFile, setImageFile] = useState(new Blob());
  const [imageElem, setImageElem] = useState(new Image());
  const [imageFileInfo, setImageFileInfo] = useState<{
    name: string;
    width: number;
    height: number;
  }>({
    name: "",
    width: 0,
    height: 0,
  });

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

  const imageUploadHandler = (event: any) => {
    event.preventDefault();
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onloadend = (ev) => {
      if (ev.target?.result) {
        const img = new Image();
        img.src = ev.target.result.toString();
        setIsImageLoaded(true);

        setImageElem(img);
        setImageFile(file);
        setImageFileInfo({
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
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
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{error?.message}</Modal.Body>
      </Modal>

      <Container fluid>
        <Row className="p-3 bg-secondary text-white">
          {!isImageLoaded && (
            <DocumentUploadForm onUpload={imageUploadHandler} />
          )}
          {isImageLoaded && (
            <DocumentStatus
              imageName={imageFileInfo.name}
              isLoading={isLoading}
              onSegmentationClick={startSegmentationHandler}
              onSendToOcrClick={sendToOCRHandler}
              segmentationData={boundingBoxes}
            />
          )}
        </Row>
        {isImageLoaded && (
          <Row className="bg-primary">
            <Col>
              <ImageCanvas
                imageSrc={imageElem}
                imageWidth={imageFileInfo.width}
                imageHeight={imageFileInfo.height}
                boundingBoxes={boundingBoxes}
                dragEndHandler={dragEndHandler}
              />
            </Col>
            <Col>
              {ocrServiceResponse.length === 0 && (
                <p>Click "send to OCR" to start the prediction</p>
              )}
              {ocrServiceResponse.length > 0 && (
                <AnnotationList
                  annotations={ocrServiceResponse}
                  listMaxheight={imageFileInfo.height}
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
