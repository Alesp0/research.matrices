import Form from "react-bootstrap/Form";

type ColorPickerProps = {
  defaultFillColor: string;
  handleColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function ColorPicker(props: ColorPickerProps) {
  return (
    <Form.Control
      as="input"
      type="color"
      id="colorInput"
      defaultValue={props.defaultFillColor}
      title="Choose your color"
      onInput={props.handleColorChange}
    />
  );
}

export default ColorPicker;
