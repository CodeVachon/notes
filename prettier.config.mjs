export default {
    plugins: ["prettier-plugin-tailwindcss"],
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    singleQuote: false,
    semi: true,
    bracketSpacing: true,
    arrowParens: "always",
    endOfLine: "lf",
    trailingComma: "none",
    overrides: [
        {
            files: "*.json",
            options: {
                tabWidth: 2
            }
        },
        {
            files: "*.yml",
            options: {
                tabWidth: 2
            }
        },
        {
            files: "*.sql",
            options: {
                newlineBeforeSemicolon: true
            }
        }
    ]
};
