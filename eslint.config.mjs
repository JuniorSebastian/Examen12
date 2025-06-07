// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname, // Añadir esto para mejor resolución de plugins
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Añade un nuevo objeto de configuración para tus reglas personalizadas
  {
    files: ["**/*.{js,jsx,ts,tsx}"], // Aplica estas reglas a todos los archivos JS/TS
    rules: {
      // Desactiva la regla no-explicit-any
      "@typescript-eslint/no-explicit-any": "off",
      // Si tienes otras reglas personalizadas, las puedes añadir aquí
    },
  },
];

export default eslintConfig;