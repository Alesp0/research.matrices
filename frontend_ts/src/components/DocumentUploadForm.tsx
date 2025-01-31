import Form from "react-bootstrap/Form";

type DocumentUploadFormProps = {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function DocumentUploadForm(props: DocumentUploadFormProps) {
  return (
    <Form.Group controlId="formFile" className="w-50 text-center">
      <Form.Label className="text-uppercase">
        Please upload document picture
      </Form.Label>

      <Form.Control
        size="sm"
        type="file"
        accept="image/*"
        onChange={props.onUpload}
      />
    </Form.Group>
  );
}

export default DocumentUploadForm;
