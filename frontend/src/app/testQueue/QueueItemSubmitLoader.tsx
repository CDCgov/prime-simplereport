import iconLoader from "uswds/dist/img/loader.svg";

type Props = {
  name: string;
};

export const QueueItemSubmitLoader = ({ name }: Props) => (
  <div
    className="z-top position-absolute height-full width-full text-center"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.92)",
    }}
  >
    <h4 className="margin-top-6 margin-bottom-5">
      Submitting test data for {name}...
    </h4>
    <img src={iconLoader} alt="submitting" className="square-5" />
  </div>
);
