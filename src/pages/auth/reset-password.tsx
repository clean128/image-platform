import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Button,
  Link,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/use-auth";

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { resetPassword, isLoading } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Get token from URL query params
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!token) {
      newErrors.general = t("auth.invalidResetToken");
    }

    if (!password) {
      newErrors.password = t("validation.passwordRequired");
    } else if (password.length < 8) {
      newErrors.password = t("validation.passwordTooShort");
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("validation.confirmPasswordRequired");
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = t("validation.passwordsDoNotMatch");
    }
  };

  return <p>Reset Password Page</p>;
};

export default ResetPasswordPage;
