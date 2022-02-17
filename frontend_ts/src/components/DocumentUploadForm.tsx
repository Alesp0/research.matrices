import Form from "react-bootstrap/Form";

type DocumentUploadFormProps = {
  onUpload: (event: any) => void;
};

function DocumentUploadForm(props: DocumentUploadFormProps) {
  return (
    <Form.Group controlId="formFile" className="w-50 text-center">
      <Form.Label>Upload Document</Form.Label>

      <Form.Control type="file" accept="image/*" onChange={props.onUpload} />
    </Form.Group>
  );
}

export default DocumentUploadForm;
