import { useState, useEffect, useRef } from "react";

/**
 * We should consider using a full, robust form component
 // use like this
 const {
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      handleSubmit
    } = useCustomForm({
      initialValues,
      onSubmit: values => console.log({ values })
    });

 * @param initialValues
 * @param onSubmit
 * @returns {{handleBlur: handleBlur, touched: {}, handleSubmit: handleSubmit, handleChange: handleChange, values: unknown, errors: {}}}
 */

const useCustomForm = ({ initialValues, onSubmit }) => {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const formRendered = useRef(true);

  useEffect(() => {
    if (!formRendered.current) {
      setValues(initialValues);
      setErrors({});
      setTouched({});
    }
    formRendered.current = false;
  }, [initialValues]);

  const handleChange = (event) => {
    const { target } = event;
    const { name, value } = target;
    // event.persist();
    setValues({ ...values, [name]: value });
  };

  const handleBlur = (event) => {
    const { target } = event;
    const { name } = target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors });
  };

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    setErrors({ ...errors });
    onSubmit({ values, errors });
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};

export default useCustomForm;
