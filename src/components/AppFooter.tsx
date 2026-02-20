export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© 2026 VM Gestão Estratégica. Todos os direitos reservados.</span>
        <span>
          Desenvolvido por{" "}
          <a
            href="https://topstack.com.br?utm_source=voigt_crm&utm_medium=software_branding&utm_campaign=dev_by_topstack"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#20D4AD] active:text-[#20D4AD]"
          >
            TOPSTACK
          </a>
        </span>
      </div>
    </footer>
  );
}
