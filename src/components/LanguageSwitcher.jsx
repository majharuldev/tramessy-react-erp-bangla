
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => changeLang("en")}
        className="px-2 py-1 border rounded"
      >
        EN
      </button>

      <button
        onClick={() => changeLang("bn")}
        className="px-2 py-1 border rounded"
      >
        বাংলা
      </button>
    </div>
  );
}
