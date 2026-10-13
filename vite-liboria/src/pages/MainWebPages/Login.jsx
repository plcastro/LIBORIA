import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../../api";
import "./login.css";
import "../../App.css";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username:
      localStorage.getItem("rememberMe") === "true"
        ? sessionStorage.getItem("rememberedUsername") || ""
        : "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem("rememberMe") === "true",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);

    if (!isChecked) {
      localStorage.setItem("rememberMe", "false");
      sessionStorage.removeItem("rememberedUsername");
    } else {
      localStorage.setItem("rememberMe", "true");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "/users/login",
        {
          username: formData.username.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const user = response.data.user;
      if (!user) {
        setError("Login failed: user information was not returned.");
        return;
      }

      sessionStorage.setItem("currentUser", JSON.stringify(user));

      if (rememberMe) {
        sessionStorage.setItem("rememberedUsername", formData.username.trim());
        localStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.removeItem("rememberedUsername");
        localStorage.setItem("rememberMe", "false");
      }

      // Redirect based on account type
      if (["student", "non-librarian"].includes(user.account_type)) {
        navigate("/student/dashboard");
      } else if (user.account_type === "librarian") {
        navigate("/dashboard/view/borrow");
      } else {
        sessionStorage.removeItem("currentUser");
        setError(
          "Unrecognized account type. Please contact the administrator.",
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      console.log("Status:", err.response?.status);
      console.log("Backend response:", err.response?.data);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="title">Login</h1>
        <p className="subtitle">Please enter your credentials to log in</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <TextField
              type="text"
              id="username"
              label="Username"
              variant="outlined"
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
              className="!w-full"
            />
          </div>

          <div className="form-group">
            <TextField
              type={showPassword ? "text" : "password"}
              id="password"
              label="Password"
              variant="outlined"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={handleClickShowPassword}
                        edge="end"
                        size="small"
                        sx={{
                          padding: "4px",
                          width: "32px",
                          height: "32px",
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {error && <div className="error text-red-700">{error}</div>}
          </div>

          <div className="flex w-full items-center">
            <div className="flex-1">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      sx={{ padding: "4px", mr: 0.5 }}
                    />
                  }
                  label="Remember me"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "14px",
                    },
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                />
              </FormGroup>
            </div>

            <div className="flex flex-1 justify-end">
              <Link
                variant="text"
                size="small"
                onClick={() => navigate("/forgot")}
                className="forgot-password !text-gray-500"
                sx={{
                  fontSize: "14px",
                  textTransform: "none",
                  minWidth: 0,
                  padding: "4px 0",
                  whiteSpace: "nowrap",
                }}
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="w-full !mt-2">
            <Button
              type="submit"
              disabled={loading}
              size="large"
              variant="contained"
              className="!w-full !bg-black"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </Button>
          </div>

          <div className="signup-link">
            Don't have an account?{" "}
            <Link onClick={() => navigate("/signup")}>Sign up here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
