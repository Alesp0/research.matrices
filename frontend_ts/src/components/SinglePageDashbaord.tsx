import { useState } from "react";

import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";

import DocumentUploadForm from "./DocumentUploadForm";

function SinglePageDashboard() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageFile, setImageFile] = useState("");

  const imageUploadHandler = (event: any) => {
    event.preventDefault();
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onloadend = (ev) => {
      if (ev.target?.result) {
        setIsImageLoaded(true);
        setImageFile(ev.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Container fluid className="p-3 bg-secondary text-white">
        {!isImageLoaded && <DocumentUploadForm onUpload={imageUploadHandler} />}
      </Container>
      {isImageLoaded && (
        <Container>
          <Image fluid src={imageFile} />
        </Container>
      )}
    </>
  );
}

export default SinglePageDashboard;
