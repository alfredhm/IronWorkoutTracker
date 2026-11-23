import { useCallback, useState } from "react";
import {
  createMeasurement,
  deleteMeasurement,
  getProgressErrorMessage,
} from "../../../resources/progressApi";

const getLocalDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const useBodyWeightMeasurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [measurementValue, setMeasurementValue] = useState("");
  const [measurementDate, setMeasurementDate] = useState(getLocalDate());
  const [measurementError, setMeasurementError] = useState("");
  const [measurementSaving, setMeasurementSaving] = useState(false);
  const [deletingMeasurementId, setDeletingMeasurementId] = useState("");

  const loadMeasurements = useCallback((records) => {
    setMeasurements(
      records.filter((measurement) => measurement.kind === "bodyWeight"),
    );
  }, []);

  const handleAddMeasurement = async (event) => {
    event.preventDefault();
    setMeasurementError("");
    setMeasurementSaving(true);
    try {
      const response = await createMeasurement({
        kind: "bodyWeight",
        value: Number(measurementValue),
        date: new Date(`${measurementDate}T12:00:00`),
      });
      setMeasurements((previous) =>
        [response.data, ...previous].sort(
          (first, second) => new Date(second.date) - new Date(first.date),
        ),
      );
      setMeasurementValue("");
    } catch (requestError) {
      setMeasurementError(
        getProgressErrorMessage(
          requestError,
          "Unable to save this measurement.",
        ),
      );
    } finally {
      setMeasurementSaving(false);
    }
  };

  const handleDeleteMeasurement = async (measurementId) => {
    setMeasurementError("");
    setDeletingMeasurementId(measurementId);
    try {
      await deleteMeasurement(measurementId);
      setMeasurements((previous) =>
        previous.filter((measurement) => measurement._id !== measurementId),
      );
    } catch (requestError) {
      setMeasurementError(
        getProgressErrorMessage(
          requestError,
          "Unable to delete this measurement.",
        ),
      );
    } finally {
      setDeletingMeasurementId("");
    }
  };

  return {
    deletingMeasurementId,
    handleAddMeasurement,
    handleDeleteMeasurement,
    loadMeasurements,
    maxDate: getLocalDate(),
    measurementDate,
    measurementError,
    measurementSaving,
    measurementValue,
    measurements,
    setMeasurementDate,
    setMeasurementValue,
  };
};

export default useBodyWeightMeasurements;
