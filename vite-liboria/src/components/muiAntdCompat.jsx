import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  Alert,
  Avatar as MuiAvatar,
  Box,
  Button as MuiButton,
  Card as MuiCard,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider as MuiDivider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select as MuiSelect,
  Snackbar,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import dateValue from "../utils/dateValue";

const FormContext = createContext(null);

const normalizeName = (name) => (Array.isArray(name) ? name.join(".") : name);

const getValueFromEvent = (eventOrValue) => {
  if (eventOrValue?.target) return eventOrValue.target.value;
  return eventOrValue;
};

const createForm = () => {
  const listeners = new Set();
  const store = {};
  const errors = {};

  const notify = () => listeners.forEach((listener) => listener());

  const validateField = async (name, value, rule, values) => {
    if (rule.required) {
      const empty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (empty) throw new Error(rule.message || "This field is required");
    }

    if (rule.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error(rule.message || "Please enter a valid email");
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      throw new Error(rule.message || "Invalid value");
    }

    if (rule.validator) {
      await rule.validator(
        { field: name },
        value,
        () => {},
        values
      );
    }
  };

  const form = {
    __subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    __registerField(name, rules = []) {
      if (!errors[name]) errors[name] = "";
      form.__rules[name] = rules;
      return () => {
        delete form.__rules[name];
      };
    },
    __rules: {},
    getFieldValue(name) {
      return store[normalizeName(name)];
    },
    getFieldsValue() {
      return { ...store };
    },
    setFieldsValue(values) {
      Object.assign(store, values);
      Object.keys(values).forEach((key) => {
        errors[key] = "";
      });
      notify();
    },
    resetFields() {
      Object.keys(store).forEach((key) => delete store[key]);
      Object.keys(errors).forEach((key) => (errors[key] = ""));
      notify();
    },
    async validateFields(options = {}) {
      const values = { ...store };
      const nextErrors = {};

      for (const [name, rawRules] of Object.entries(form.__rules)) {
        const value = store[name];
        const rules = rawRules.flatMap((rule) =>
          typeof rule === "function" ? [rule(form)] : [rule]
        );

        try {
          for (const rule of rules) {
            await validateField(name, value, rule, values);
          }
          nextErrors[name] = "";
        } catch (error) {
          nextErrors[name] = error?.message || String(error);
        }
      }

      Object.assign(errors, nextErrors);
      if (!options.validateOnly) notify();

      const failed = Object.values(nextErrors).find(Boolean);
      if (failed) throw new Error(failed);
      return values;
    },
    __getError(name) {
      return errors[name] || "";
    },
  };

  return form;
};

const useForm = (form) => {
  const [internalForm] = useState(() => form || createForm());
  return [form || internalForm];
};

const useWatch = (_name, form) => {
  const [, rerender] = useReducer((count) => count + 1, 0);
  React.useEffect(() => form?.__subscribe(rerender), [form]);
  return form?.getFieldsValue();
};

const Field = ({ name, label, rules = [], children, shouldUpdate }) => {
  const form = useContext(FormContext);
  const [, rerender] = useReducer((count) => count + 1, 0);
  const fieldName = normalizeName(name);

  React.useEffect(() => {
    if (!form || !fieldName) return undefined;
    return form.__registerField(fieldName, rules);
  }, [fieldName, form, rules]);

  React.useEffect(() => form?.__subscribe(rerender), [form]);

  if (typeof children === "function") {
    return <>{children(form)}</>;
  }

  if (shouldUpdate && !name) {
    return <Box sx={{ mb: 2 }}>{children}</Box>;
  }

  const error = fieldName ? form?.__getError(fieldName) : "";
  const value = fieldName ? form?.getFieldValue(fieldName) ?? "" : undefined;

  const child = React.isValidElement(children)
    ? React.cloneElement(children, {
        value,
        error: Boolean(error),
        helperText: error || children.props.helperText,
        label: children.props.label ?? label,
        onChange: (...args) => {
          const nextValue = getValueFromEvent(args[0]);
          if (fieldName) form.setFieldsValue({ [fieldName]: nextValue });
          children.props.onChange?.(...args);
        },
      })
    : children;

  return <Box sx={{ mb: 2 }}>{child}</Box>;
};

const Form = ({ form, children, onFinish, initialValues, style, ...props }) => {
  const [internalForm] = useForm(form);

  React.useEffect(() => {
    if (initialValues) internalForm.setFieldsValue(initialValues);
  }, [initialValues, internalForm]);

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    try {
      const values = await internalForm.validateFields();
      onFinish?.(values);
    } catch {
      // Validation errors are surfaced beside the fields.
    }
  };

  return (
    <FormContext.Provider value={internalForm}>
      <Box component="form" onSubmit={handleSubmit} style={style} {...props}>
        {children}
      </Box>
    </FormContext.Provider>
  );
};

Form.Item = Field;
Form.useForm = useForm;
Form.useWatch = useWatch;

const InputBase = React.forwardRef(({ readOnly, prefix, ...props }, ref) => (
  <TextField
    fullWidth
    size="small"
    inputRef={ref}
    InputProps={{
      readOnly,
      startAdornment: prefix ? (
        <InputAdornment position="start">{prefix}</InputAdornment>
      ) : undefined,
      ...props.InputProps,
    }}
    {...props}
  />
));

const Input = Object.assign(InputBase, {
  Password: (props) => <InputBase type="password" {...props} />,
  TextArea: ({ rows = 3, ...props }) => (
    <InputBase multiline minRows={rows} {...props} />
  ),
});

const InputNumber = ({ formatter, parser, onChange, value, ...props }) => {
  const displayValue = formatter && value !== "" && value !== undefined
    ? formatter(value)
    : value ?? "";

  return (
    <TextField
      fullWidth
      size="small"
      type={formatter ? "text" : "number"}
      value={displayValue}
      onChange={(event) => {
        const raw = parser ? parser(event.target.value) : event.target.value;
        const numeric = raw === "" ? "" : Number(raw);
        onChange?.(numeric);
      }}
      {...props}
    />
  );
};

const DatePicker = ({ value, onChange, disabledDate, style, ...props }) => {
  const dayValue = value?.format ? value.format("YYYY-MM-DD") : value || "";

  return (
    <TextField
      fullWidth
      size="small"
      type="date"
      value={dayValue}
      onChange={(event) => {
        const next = event.target.value;
        onChange?.(dateValue(next));
      }}
      inputProps={{
        onKeyDown: (event) => event.preventDefault(),
      }}
      style={style}
      {...props}
    />
  );
};

const Select = ({ children, options, mode, value, onChange, placeholder, ...props }) => {
  const isMultiple = mode === "tags" || mode === "multiple";
  const items =
    options ||
    React.Children.toArray(children).map((child) => ({
      label: child.props.children,
      value: child.props.value,
    }));

  return (
    <FormControl fullWidth size="small" error={props.error}>
      <MuiSelect
        multiple={isMultiple}
        displayEmpty
        value={isMultiple ? value || [] : value || ""}
        onChange={(event) => onChange?.(event.target.value)}
        renderValue={(selected) => {
          if (!selected || (Array.isArray(selected) && !selected.length)) {
            return <span style={{ color: "#888" }}>{placeholder}</span>;
          }
          return Array.isArray(selected) ? selected.join(", ") : selected;
        }}
        {...props}
      >
        {!isMultiple && placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {items.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {props.helperText && <FormHelperText>{props.helperText}</FormHelperText>}
    </FormControl>
  );
};

Select.Option = ({ children }) => children;

const Modal = ({
  open,
  title,
  children,
  footer,
  onCancel,
  onOk,
  okText = "OK",
  cancelText = "Cancel",
  confirmLoading,
  width,
}) => (
  <Dialog open={Boolean(open)} onClose={onCancel} maxWidth="sm" fullWidth PaperProps={{ sx: { maxWidth: width } }}>
    {title && <DialogTitle>{title}</DialogTitle>}
    <DialogContent dividers>{children}</DialogContent>
    {footer === null ? null : (
      <DialogActions>
        {Array.isArray(footer) || React.isValidElement(footer) ? (
          footer
        ) : (
          <>
            <Button onClick={onCancel}>{cancelText}</Button>
            <Button type="primary" onClick={onOk} disabled={confirmLoading}>
              {okText}
            </Button>
          </>
        )}
      </DialogActions>
    )}
  </Dialog>
);

const Button = ({ type, danger, icon, children, htmlType, ...props }) => (
  <MuiButton
    variant={type === "link" ? "text" : type === "primary" ? "contained" : "outlined"}
    color={danger ? "error" : "primary"}
    type={htmlType}
    startIcon={icon}
    {...props}
  >
    {children}
  </MuiButton>
);

const Row = ({ children, gutter, justify, align, style, ...props }) => (
  <Grid
    container
    spacing={Array.isArray(gutter) ? gutter[0] / 8 : gutter ? gutter / 8 : 0}
    justifyContent={justify}
    alignItems={align}
    style={style}
    {...props}
  >
    {children}
  </Grid>
);

const getColSize = (value) => {
  if (!value) return undefined;
  if (typeof value === "number") return Math.max(1, Math.round(value / 2));
  if (typeof value === "object" && value.span) return Math.max(1, Math.round(value.span / 2));
  return undefined;
};

const Col = ({ children, span, xs, sm, md, lg, style, ...props }) => (
  <Grid
    item
    xs={getColSize(xs) || getColSize(span) || 12}
    sm={getColSize(sm)}
    md={getColSize(md)}
    lg={getColSize(lg)}
    style={style}
    {...props}
  >
    {children}
  </Grid>
);

const Space = ({ children, style, align }) => (
  <Box sx={{ display: "flex", gap: 1, alignItems: align || "center" }} style={style}>
    {children}
  </Box>
);

const Card = ({ children, style }) => (
  <MuiCard style={style} sx={{ p: 2 }}>
    {children}
  </MuiCard>
);

const Divider = ({ children }) => (
  <MuiDivider sx={{ my: 3 }}>
    {children}
  </MuiDivider>
);

const Tag = ({ color, children }) => (
  <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: color === "red" ? "#ffebee" : color === "green" ? "#e8f5e9" : "#e3f2fd", color: color === "red" ? "#c62828" : color === "green" ? "#2e7d32" : "#1565c0", fontSize: 12 }}>
    {children}
  </Box>
);

const Spin = () => <CircularProgress size={24} />;

const Avatar = ({ size, icon, ...props }) => (
  <MuiAvatar sx={{ width: size, height: size, mx: "auto" }} {...props}>
    {icon}
  </MuiAvatar>
);

const Table = ({ columns = [], dataSource = [], rowKey, loading, pagination, scroll, style }) => {
  const [page, setPage] = useState(0);
  const pageSize = pagination?.pageSize || dataSource.length || 10;
  const rows = pagination === false ? dataSource : dataSource.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Box style={style}>
      <TableContainer sx={{ maxHeight: scroll?.y, overflowX: scroll?.x ? "auto" : undefined }}>
        <MuiTable stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key || column.dataIndex} align={column.align} sx={{ width: column.width, fontWeight: 700 }}>
                  {column.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((record, index) => (
                <TableRow key={typeof rowKey === "function" ? rowKey(record) : record[rowKey] || index} hover>
                  {columns.map((column) => {
                    const value = column.dataIndex ? record[column.dataIndex] : undefined;
                    return (
                      <TableCell key={column.key || column.dataIndex} align={column.align}>
                        {column.render ? column.render(value, record, index) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {pagination !== false && (
        <TablePagination
          component="div"
          count={dataSource.length}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onPageChange={(_, nextPage) => setPage(nextPage)}
        />
      )}
    </Box>
  );
};

const MessageHolder = ({ state, onClose }) => (
  <Snackbar open={state.open} autoHideDuration={3000} onClose={onClose}>
    <Alert severity={state.severity} variant="filled" onClose={onClose}>
      {state.text}
    </Alert>
  </Snackbar>
);

const useMessage = () => {
  const [state, setState] = useState({ open: false, severity: "info", text: "" });
  const show = (severity, text) => setState({ open: true, severity, text });
  const api = {
    success: (text) => show("success", text),
    error: (text) => show("error", text),
    warning: (text) => show("warning", text),
    info: (text) => show("info", text),
  };
  return [
    api,
    <MessageHolder
      key="message-holder"
      state={state}
      onClose={() => setState((prev) => ({ ...prev, open: false }))}
    />,
  ];
};

const message = {
  useMessage,
  success: (text) => window.alert(text),
  error: (text) => window.alert(text),
  warning: (text) => window.alert(text),
  info: (text) => window.alert(text),
};

const MenuNode = ({ item, selectedKeys, onClick, level = 0 }) => {
  const [open, setOpen] = useState(true);
  const selected = selectedKeys?.includes(item.key);

  if (item.children) {
    return (
      <>
        <ListItemButton onClick={() => setOpen((value) => !value)} sx={{ pl: 2 + level * 2, color: "white" }}>
          {item.icon && <ListItemIcon sx={{ color: "white", minWidth: 36 }}>{item.icon}</ListItemIcon>}
          <ListItemText primary={item.label} />
        </ListItemButton>
        <Collapse in={open}>
          {item.children.map((child) => (
            <MenuNode key={child.key} item={child} selectedKeys={selectedKeys} onClick={onClick} level={level + 1} />
          ))}
        </Collapse>
      </>
    );
  }

  return (
    <ListItemButton
      selected={selected}
      onClick={() => onClick?.({ key: item.key })}
      sx={{
        pl: 2 + level * 2,
        color: "white",
        "&.Mui-selected": { bgcolor: "#1677ff" },
        "&.Mui-selected:hover": { bgcolor: "#1677ff" },
      }}
    >
      {item.icon && <ListItemIcon sx={{ color: "white", minWidth: 36 }}>{item.icon}</ListItemIcon>}
      <ListItemText primary={item.label} />
    </ListItemButton>
  );
};

const Menu = ({ items = [], selectedKeys, onClick, style }) => (
  <List style={style}>
    {items.map((item) => (
      <MenuNode key={item.key} item={item} selectedKeys={selectedKeys} onClick={onClick} />
    ))}
  </List>
);

const Layout = ({ children, style }) => <Box style={style}>{children}</Box>;
Layout.Header = ({ children, style }) => <Box component="header" style={style}>{children}</Box>;
Layout.Footer = ({ children, style }) => <Box component="footer" style={style}>{children}</Box>;
Layout.Content = ({ children, style }) => <Box component="main" style={style}>{children}</Box>;
Layout.Sider = ({ children, style, width }) => <Box component="aside" style={{ width, ...style }}>{children}</Box>;

const Flex = ({ children, gap, wrap, style }) => (
  <Box style={{ display: "flex", gap, flexWrap: wrap ? "wrap" : undefined, ...style }}>
    {children}
  </Box>
);

const Drawer = ({ open, onClose, children, width, style }) => (
  <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width, m: 0, height: "100%", position: "fixed", left: 0, top: 0, ...style } }}>
    {children}
  </Dialog>
);

const GridCompat = {
  useBreakpoint: () => {
    const lg = useMediaQuery("(min-width:1200px)");
    return { lg };
  },
};

export {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Flex,
  Form,
  GridCompat as Grid,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  message,
};
