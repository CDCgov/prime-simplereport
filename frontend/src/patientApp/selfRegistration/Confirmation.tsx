import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  personName: string;
  entityName: string;
};

export const Confirmation = ({ personName, entityName }: Props) => {
  return (
    <div className="grid-container maxw-tablet padding-y-3">
      <div className="prime-formgroup">
        <div className="grid-row flex-no-wrap flex-align-center">
          <FontAwesomeIcon
            className="text-green font-ui-3xl"
            icon={faCheckCircle}
          />
          <p className="padding-left-2">
            <span className="text-bold">{personName}</span>, you're registered
            for a COVID-19 test at {entityName}.
          </p>
        </div>
        <div>
          <p>
            When you arrive for your test, check in by providing your first and
            last name.
          </p>
        </div>
      </div>
    </div>
  );
};
