import { useState, useMemo } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  IconButton,
  Link,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QRCode from "qrcode.react";

function App() {
  const [url, setUrl] = useState("");
  const [ttl, setTtl] = useState<number>(5);
  const [items, setItems] = useState<
    Array<{ id: string; shortLink: string; expiresAt: number; targetUrl: string }>
  >([]);

  const apiBase = useMemo(() => "http://localhost:5000", []);

  const handleShorten = async () => {
    if (!url.trim()) return;
    try {
      const res = await fetch(`${apiBase}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: url.trim(), ttl }),
      });
      if (!res.ok) throw new Error("Failed to create short link");
      const data = await res.json();
      setItems((prev) => [
        {
          id: data.id,
          shortLink: data.shortLink,
          expiresAt: data.expiresAt,
          targetUrl: url.trim(),
        },
        ...prev,
      ]);
      setUrl("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating the short link.");
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Affordmed URL Shortener
          </Typography>
          <Button
            color="inherit"
            href="http://localhost:5000/history"
            target="_blank"
            rel="noreferrer"
          >
            History API
          </Button>
        </Toolbar>
      </AppBar>

      <Container className="container">
        <Typography variant="h5" gutterBottom>
          Shorten a URL
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Enter a URL"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <TextField
            label="TTL (minutes)"
            type="number"
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value) || 1)}
            inputProps={{ min: 1 }}
            sx={{ width: { xs: "100%", sm: 160 } }}
          />
          <Button variant="contained" onClick={handleShorten}>
            Create
          </Button>
        </Stack>

        <Box mt={3}>
          <Stack spacing={2}>
            {items.map((item) => (
              <Card key={item.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="body1">
                        Short URL:{" "}
                        <Link
                          href={item.shortLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.shortLink}
                        </Link>
                        <IconButton
                          size="small"
                          onClick={() => copy(item.shortLink)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Original: {item.targetUrl}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires: {new Date(item.expiresAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ alignSelf: { xs: "center", sm: "auto" } }}>
                      <QRCode value={item.shortLink} size={96} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Neutral footer without personal details */}
        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} URL Shortener — All rights reserved.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default App;

