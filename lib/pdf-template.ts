type PdfTemplateParams = {
  styles: string
  htmlContent: string
  baseHref: string
  pageBackground: string
  componentBackground: string
}

export const buildCatalogPdfHtml = ({
  styles,
  htmlContent,
  baseHref,
  pageBackground,
  componentBackground,
}: PdfTemplateParams) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <base href="${baseHref}" />
    <style>
      ${styles}
      body {
        background: ${pageBackground};
      }
      #pdf-root {
        width: 980px;
        margin: 0 auto;
        padding: 24px;
        --pdf-card-bg: ${componentBackground};
      }
      .pdf-card-list {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .pdf-card {
        border: 2px solid rgba(15, 23, 42, 0.18);
        border-radius: 18px;
        padding: 16px;
        background: var(--pdf-card-bg);
      }
      .pdf-card-body {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 18px;
        align-items: center;
      }
      .pdf-card-title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 6px;
        color: rgba(15, 23, 42, 1);
      }
      .pdf-card-desc {
        font-size: 13px;
        color: rgba(71, 85, 105, 1);
        line-height: 1.5;
      }
      .pdf-card-price {
        display: inline-block;
        margin-top: 10px;
        padding: 6px 12px;
        border-radius: 10px;
        border: 2px solid rgba(15, 23, 42, 0.3);
        background: transparent;
        font-weight: 700;
        color: rgba(15, 23, 42, 1);
      }
      .pdf-card-image {
        width: 280px;
        height: 280px;
        border-radius: 16px;
        overflow: hidden;
        border: 2px solid rgba(15, 23, 42, 0.18);
        background: #fff;
      }
      .pdf-card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .pdf-checklist {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px;
        border: 2px solid rgba(15, 23, 42, 0.18);
        border-radius: 18px;
        background: var(--pdf-card-bg);
      }
      .pdf-checklist-header {
        padding: 8px 12px 12px;
        border-bottom: 2px dashed rgba(15, 23, 42, 0.18);
      }
      .pdf-checklist-title {
        font-size: 22px;
        font-weight: 700;
        color: rgba(15, 23, 42, 1);
        margin-bottom: 4px;
      }
      .pdf-checklist-subtitle {
        font-size: 12px;
        color: rgba(71, 85, 105, 1);
      }
      .pdf-checklist-item {
        display: grid;
        grid-template-columns: 72px 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 10px 12px;
        border-radius: 14px;
        border: 2px solid transparent;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .pdf-checklist-thumb {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid rgba(15, 23, 42, 0.18);
        background: #fff;
      }
      .pdf-checklist-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .pdf-checklist-name {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 2px;
        color: rgba(15, 23, 42, 1);
      }
      .pdf-checklist-desc {
        font-size: 12px;
        color: rgba(71, 85, 105, 1);
        line-height: 1.4;
      }
      .pdf-checklist-price {
        padding: 6px 12px;
        border-radius: 12px;
        border: 2px solid rgba(15, 23, 42, 0.3);
        background: transparent;
        font-weight: 700;
        color: rgba(15, 23, 42, 1);
        white-space: nowrap;
      }
      @page { size: A4; margin: 12mm; }
      @media print {
        body { zoom: 0.9; }
        #pdf-root { width: 980px; }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          box-shadow: none !important;
          transition: none !important;
        }
        img { max-width: 100%; height: auto; }
        .print\\:flex-row { flex-direction: row !important; }
        .print\\:flex-row-reverse { flex-direction: row-reverse !important; }
        .print-card {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .print-image { width: 256px !important; }
        .pdf-card {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .pdf-checklist-item {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
  <body class="bg-background text-foreground">
    <div id="pdf-root">
      ${htmlContent}
    </div>
  </body>
</html>`
