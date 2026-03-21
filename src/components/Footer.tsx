import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/murcielago-logo.png";

const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const links = [
    { label: t("footerAbout"), to: "/about" },
    { label: t("footerContact"), to: "/contact" },
    { label: t("footerFaq"), to: "/faq" },
    { label: t("footerHowItWorks"), to: "/how-it-works" },
    { label: t("footerSupport"), to: "/support" },
    { label: t("footerPricing"), to: "/pricing" },
    { label: t("footerChangelog"), to: "/changelog" },
    { label: t("footerFeedback"), to: "/feedback" },
    { label: t("footerAccessibility"), to: "/accessibility" },
    { label: t("footerPrivacy"), to: "/privacy" },
    { label: t("footerTerms"), to: "/terms" },
    { label: t("footerCookies"), to: "/cookies" },
    { label: t("footerDeleteAccount"), to: "/delete-account" },
    { label: t("footerReport"), to: "/contact?subject=bug" },
  ];

  return (
    <footer className="bg-card border-t border-border mt-12 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Murciélingo" className="w-8 h-8 object-contain" />
            <span className="font-heading font-bold text-foreground">Murciélingo</span>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm">
            {links.map((link) => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 text-center sm:text-left text-xs text-muted-foreground">
          © {new Date().getFullYear()} Murciélingo. {t("footerRights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
