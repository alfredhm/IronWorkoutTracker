import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { calculateBMI } from "../../../resources/progressData";

const useAccountProfile = (dashboardRefresh, onProfileClose) => {
  const location = useLocation();
  const userState = location.state || {};
  const [profileValues, setProfileValues] = useState({
    name: userState.name || "",
    email: userState.email || "",
    heightInches: userState.heightInches ?? "",
  });
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [profileSubmitError, setProfileSubmitError] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [latestBodyWeight, setLatestBodyWeight] = useState(null);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const [profileResult, measurementsResult] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/users/me", {
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/users/me/measurements", {
          withCredentials: true,
        }),
      ]);
      if (!active) return;

      const failedRequests = [];
      if (profileResult.status === "fulfilled") {
        const profile = profileResult.value.data;
        setProfileValues({
          name: profile.name || userState.name || "",
          email: profile.email || userState.email || "",
          heightInches: profile.heightInches ?? "",
        });
      } else {
        console.error("Failed to load account profile:", profileResult.reason);
        setProfileValues((current) => ({
          ...current,
          name: current.name || userState.name || "",
          email: current.email || userState.email || "",
        }));
        failedRequests.push("account details");
      }

      if (measurementsResult.status === "fulfilled") {
        const measurements = measurementsResult.value.data;
        const weightEntry = measurements
          .filter((measurement) => measurement.kind === "bodyWeight")
          .sort(
            (first, second) =>
              new Date(second.date) - new Date(first.date),
          )[0];
        setLatestBodyWeight(weightEntry || null);
      } else {
        console.error(
          "Failed to load account measurements:",
          measurementsResult.reason,
        );
        failedRequests.push("body weight");
      }

      setProfileLoadError(
        failedRequests.length > 0
          ? `Unable to load ${failedRequests.join(" and ")}. Please retry.`
          : "",
      );
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [dashboardRefresh, location.state, userState.email, userState.name]);

  const profileFormik = useFormik({
    initialValues: { ...profileValues },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Name is required")
        .max(50, "Name cannot exceed 50 characters"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      heightInches: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .min(24, "Height must be at least 24 inches.")
        .max(96, "Height cannot exceed 96 inches."),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setProfileUpdateSuccess(false);
      setProfileSubmitError(false);
      try {
        const updates = {
          ...values,
          heightInches:
            values.heightInches === "" || values.heightInches == null
              ? null
              : Number(values.heightInches),
        };
        const response = await axios.put(
          "http://localhost:5000/api/users/me",
          updates,
          { withCredentials: true },
        );

        setProfileUpdateSuccess(true);
        setProfileValues({
          name: response.data.name || updates.name,
          email: response.data.email || updates.email,
          heightInches:
            response.data.heightInches === undefined
              ? updates.heightInches ?? ""
              : response.data.heightInches ?? "",
        });
        setTimeout(onProfileClose, 1000);
      } catch (error) {
        console.error("Failed to update profile:", error);
        setProfileSubmitError(true);
      }
    },
  });

  const bmi = useMemo(
    () => calculateBMI(latestBodyWeight?.value, profileValues.heightInches),
    [latestBodyWeight, profileValues.heightInches],
  );
  const bodyStats = [
    {
      label: "Height",
      value: profileValues.heightInches
        ? `${Number(profileValues.heightInches).toFixed(1).replace(/\.0$/, "")} in`
        : "Not set",
    },
    {
      label: "Body weight",
      value: latestBodyWeight
        ? `${Number(latestBodyWeight.value).toFixed(1).replace(/\.0$/, "")} lb`
        : "Not logged",
    },
    {
      label: "BMI",
      value: bmi === null ? "—" : bmi.toFixed(1),
    },
  ];

  return {
    bodyStats,
    profileFormik,
    profileLoadError,
    profileSubmitError,
    profileUpdateSuccess,
    profileValues,
  };
};

export default useAccountProfile;
