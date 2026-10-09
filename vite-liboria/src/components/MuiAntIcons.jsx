import React from "react";
import { SvgIcon } from "@mui/material";

const makeIcon = (path, viewBox = "0 0 24 24") =>
  function Icon(props) {
    return (
      <SvgIcon viewBox={viewBox} fontSize="small" {...props}>
        {path}
      </SvgIcon>
    );
  };

export const SearchOutlined = makeIcon(
  <path d="M9.5 3a6.5 6.5 0 0 1 5.16 10.45l4.45 4.44-1.42 1.42-4.44-4.45A6.5 6.5 0 1 1 9.5 3Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
);

export const PlusOutlined = makeIcon(
  <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
);

export const ReloadOutlined = makeIcon(
  <path d="M12 5a7 7 0 0 1 6.32 4H16l3.5 3.5L23 9h-2.58A9 9 0 1 0 21 12h-2a7 7 0 1 1-7-7Z" />
);

export const EditOutlined = makeIcon(
  <path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25Zm15.71-10.04a1 1 0 0 0 0-1.42l-1.5-1.5a1 1 0 0 0-1.42 0l-1.02 1.02 2.75 2.75 1.19-1.19Z" />
);

export const UserOutlined = makeIcon(
  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
);

export const BookOutlined = makeIcon(
  <path d="M6 4h11a2 2 0 0 1 2 2v14H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Zm1 12h10V6H6v11a1 1 0 0 0 1 1Z" />
);

export const ArrowLeftOutlined = makeIcon(
  <path d="M20 11v2H7.83l5.59 5.59L12 20 4 12l8-8 1.42 1.41L7.83 11H20Z" />
);

export const UnorderedListOutlined = makeIcon(
  <path d="M4 6.5A1.5 1.5 0 1 1 5.5 8 1.5 1.5 0 0 1 4 6.5ZM8 6h12v2H8V6Zm-4 6a1.5 1.5 0 1 1 1.5 1.5A1.5 1.5 0 0 1 4 12Zm4-1h12v2H8v-2Zm-4 6.5A1.5 1.5 0 1 1 5.5 19 1.5 1.5 0 0 1 4 17.5ZM8 17h12v2H8v-2Z" />
);

export const ContactsOutlined = makeIcon(
  <path d="M6 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm-1 8h10c-.44-2-2.54-3.5-5-3.5S7.44 15 7 17Z" />
);

export const MenuOutlined = makeIcon(
  <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
);
