import { Box } from "@mui/material";

export default function Footer(){
    return (
        <Box
            component="footer"
            sx={{
                textAlign: "center",
                py: 4,
                borderTop: "1px solid #1f2937",
                fontSize: "0.85rem",
                color: "#9ca3af",
                mt: "auto",
            }}
        >
        © {new Date().getFullYear()} Lúpulos · Hecho con 🍻 por Nacho Díaz
        </Box>
    )
}


