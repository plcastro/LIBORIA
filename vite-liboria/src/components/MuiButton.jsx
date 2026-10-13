import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

export default function MuiButton({
  type,
  htmlType,
  danger,
  icon,
  loading,
  block,
  ghost,
  shape,
  size,
  children,
  style,
  form,
  className = "",
  ...props
}) {
  const variant = props.variant === "solid" ? "contained" : props.variant || (type === "primary" ? "contained" : type === "link" || type === "text" ? "text" : "outlined");
  const iconOnly = icon && !children;
  const height = size === "small" ? 24 : size === "large" ? 40 : 32;
  const color = danger ? "error" : props.color === "default" ? "inherit" : props.color || "primary";

  return <Button
    {...props}
    type={htmlType || (type === "submit" ? "submit" : "button")}
    form={typeof form === "string" ? form : undefined}
    href={props.href}
    className={`ant-btn ${className}`.trim()}
    variant={ghost ? "outlined" : variant}
    color={color}
    size={size === "small" || size === "large" ? size : "medium"}
    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : iconOnly ? undefined : icon}
    disabled={props.disabled || Boolean(loading)}
    fullWidth={block}
    sx={{
      textTransform: "none",
      fontFamily: "inherit",
      fontWeight: 400,
      fontSize: 14,
      lineHeight: 1,
      minWidth: iconOnly ? height : 0,
      width: iconOnly ? height : undefined,
      height,
      padding: iconOnly ? 0 : size === "small" ? "0 7px" : size === "large" ? "0 15px" : "0 15px",
      borderRadius: shape === "circle" || shape === "round" ? "999px" : "6px",
      boxShadow: "none",
      ...(type === "link" ? { padding: 0, height: "auto", minWidth: 0 } : {}),
      ...style,
    }}
  >{iconOnly ? icon : children}</Button>;
}
