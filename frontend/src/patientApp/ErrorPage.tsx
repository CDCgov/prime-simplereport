import { ApolloError } from "@apollo/client";

interface Props {
  error: ApolloError;
}

const ErrorPage: any = (props: Props) => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <div>
                <h2>Error</h2>
              </div>
            </div>
            <div className="usa-card__body">{props.error.message}</div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
