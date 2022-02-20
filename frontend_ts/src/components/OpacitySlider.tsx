import Form from "react-bootstrap/Form";

type OpacitySliderProps = {
  opacity: number;
  handleOpacitySlider: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function OpacitySlider(props: OpacitySliderProps) {
  return (
    <Form.Range
      className="w-50"
      min={0}
      max={1}
      step={0.1}
      defaultValue={props.opacity}
      onChange={props.handleOpacitySlider}
    />
  );
}

export default OpacitySlider;
