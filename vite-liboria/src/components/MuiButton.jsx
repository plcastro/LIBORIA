import Button from '@mui/material/Button';

export default function MuiButton({ type, htmlType, danger, icon, loading, block, children, style, ...props }) {
  return <Button {...props} type={htmlType || 'button'} variant={type === 'primary' || props.variant === 'solid' ? 'contained' : type === 'link' || type === 'text' ? 'text' : 'outlined'} color={danger ? 'error' : props.color || 'primary'} startIcon={icon} disabled={props.disabled || loading} fullWidth={block} sx={{ textTransform: 'none', fontFamily: 'inherit', borderRadius: '6px', minWidth: 0, ...style }}>{children}</Button>;
}
