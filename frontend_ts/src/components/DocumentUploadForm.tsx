import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

type DocumentUploadFormProps = {
  onUpload: (event: any) => void;
};

function DocumentUploadForm(props: DocumentUploadFormProps) {
  return (
    <Form.Group controlId="formFile">
      <Row>
        <Col sm={2}>
          <Form.Label>Upload Document</Form.Label>
        </Col>
        <Col sm={10}>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={props.onUpload}
          />
        </Col>
      </Row>
    </Form.Group>
  );
}

export default DocumentUploadForm;
