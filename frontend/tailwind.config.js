/** @type {import('tailwindcss').Config} */
module.exports = {
  // Arquivos que o Tailwind deve escanear para encontrar classes CSS
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    // Aqui você pode estender o tema padrão do Tailwind (cores, fontes, etc.)
    extend: {},
  },
  // Plugins do Tailwind, como o de formulários, que melhora a estilização padrão
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
