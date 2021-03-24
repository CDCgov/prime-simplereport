import Alert from "./Alert";

export const TrainingNotification: React.FC = () => {
  return (
    <div className="sr-training-banner">
      <div className="usa-nav-container">
        <Alert type="info" slim>
          This is a training site with fake data to be used for training
          purposes only
        </Alert>
      </div>
    </div>
  );
};
