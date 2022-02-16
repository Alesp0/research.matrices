import Modal from "react-bootstrap/Modal";

type ErrorModalProps = {
  show: boolean;
  error?: Error;
  onHide: () => void;
};

function ErrorModal(props: ErrorModalProps) {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.error?.message}</Modal.Body>
    </Modal>
  );
}

export default ErrorModal;
