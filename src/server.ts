import "dotenv/config";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const PORT = process.env.PORT || 3000;

await connectDatabase();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

