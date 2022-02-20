import { useState } from "react";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import ErrorModal from "./ErrorModal";
import ImageCanvas from "./ImageCanvas";
import DocumentUploadForm from "./DocumentUploadForm";
import DocumentStatus from "./DocumentStatus";
import AnnotationList from "./AnnotationList";
import AnnotationListPlaceholder from "./AnnotationListPlaceholder";
import {
  TextDetectionResponseData,
  BoundingBox,
} from "../models/textDetection";
import * as React from "react";

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

  const [drawRectAllowed, setDrawRectAllowed] = useState(false);
  const [fillColor, setFillColor] = useState("#ab0a60");

  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [selectedBoxID, setSelectedBoxID] = useState<string | null>(null);

  const [ocrServiceResponse, setOcrServiceResponse] = useState<string[]>([]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFillColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFillColor(event.target.value);
  };

  const handleDeleteBox = () => {
    if (selectedBoxID) {
      setBoundingBoxes((previousState) => {
        const newState: BoundingBox[] = [];
        for (const box of previousState) {
          if (box.id !== selectedBoxID) {
            newState.push(box);
          }
        }
        setSelectedBoxID(null);
        return newState;
      });
    }
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

      {!isImageLoaded && (
        <Container>
          <Row className="mt-5 justify-content-center">
            <DocumentUploadForm onUpload={imageUploadHandler} />
          </Row>
        </Container>
      )}

      <Container fluid>
        {isImageLoaded && imageInfo && (
          <Row className="pt-1 pb-1">
            <DocumentStatus
              imageName={imageInfo.name}
              isLoading={isLoading}
              drawRectAllowed={drawRectAllowed}
              selectedBoxID={selectedBoxID}
              setDrawRectAllowed={setDrawRectAllowed}
              onDeleteBoxClick={handleDeleteBox}
              onSegmentationClick={startSegmentationHandler}
              onSendToOcrClick={sendToOCRHandler}
              segmentationData={boundingBoxes}
              fillColor={fillColor}
              handleFillColorChange={handleFillColorChange}
            />
          </Row>
        )}

        {isImageLoaded && imageElem && imageInfo && (
          <Row>
            <Col>
              <Row>
                <ImageCanvas
                  imageSrc={imageElem}
                  imageWidth={imageInfo.width}
                  imageHeight={imageInfo.height}
                  boundingBoxes={boundingBoxes}
                  fillColor={fillColor}
                  drawRectAllowed={drawRectAllowed}
                  selectedBoxID={selectedBoxID}
                  setSelectedBoxID={setSelectedBoxID}
                  setBoundingBoxes={setBoundingBoxes}
                  setDrawRectAllowed={setDrawRectAllowed}
                />
              </Row>
            </Col>
            <Col>
              <Row>
                {ocrServiceResponse.length === 0 && (
                  <AnnotationListPlaceholder
                    annotationsNumber={boundingBoxes.length}
                    listMaxheight={imageInfo.height}
                  />
                )}
                {ocrServiceResponse.length > 0 && (
                  <AnnotationList
                    annotations={ocrServiceResponse}
                    listMaxheight={imageInfo.height}
                  />
                )}
              </Row>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}

export default SinglePageDashboard;
