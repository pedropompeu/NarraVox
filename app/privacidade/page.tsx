import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — NarraVox",
};

const S = {
  page: {
    minHeight: "100vh",
    backgroundColor: "var(--paper)",
    padding: "48px 24px",
  } as React.CSSProperties,
  wrap: { maxWidth: 680, margin: "0 auto" } as React.CSSProperties,
  back: {
    color: "var(--glass)",
    fontSize: "0.875rem",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
  } as React.CSSProperties,
  h1: {
    fontFamily: "var(--font-serif)",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "var(--ink)",
    letterSpacing: "-0.02em",
    marginBottom: 8,
    marginTop: 0,
  } as React.CSSProperties,
  meta: { color: "var(--ink-muted)", fontSize: "0.875rem", margin: 0 } as React.CSSProperties,
  card: {
    backgroundColor: "var(--paper-edge)",
    border: "1px solid rgba(120,90,60,.18)",
    borderRadius: 12,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 28,
    fontSize: "0.9375rem",
    lineHeight: 1.75,
    color: "var(--ink)",
    marginTop: 32,
  } as React.CSSProperties,
  h2: {
    fontFamily: "var(--font-serif)",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: 8,
    marginTop: 0,
    color: "var(--ink)",
  } as React.CSSProperties,
  p: { margin: 0 } as React.CSSProperties,
  code: {
    fontFamily: "monospace",
    fontSize: "0.875em",
    backgroundColor: "rgba(120,90,60,.10)",
    padding: "1px 5px",
    borderRadius: 3,
  } as React.CSSProperties,
  badge: (color: string) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: "0.78rem",
    fontWeight: 700,
    background: color === "green" ? "rgba(63,122,31,.12)" : "rgba(59,130,246,.12)",
    color: color === "green" ? "#3F7A1F" : "#1D4ED8",
    border: `1px solid ${color === "green" ? "rgba(63,122,31,.25)" : "rgba(59,130,246,.25)"}`,
    marginRight: 6,
  } as React.CSSProperties),
};

export default function PrivacidadePage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.back}>← Voltar para o NarraVox</Link>

        <h1 style={S.h1}>Política de Privacidade</h1>
        <p style={S.meta}>Última atualização: maio de 2026</p>

        <div style={S.card}>

          {/* Resumo rápido */}
          <section>
            <h2 style={S.h2}>Resumo em uma linha</h2>
            <p style={S.p}>
              O NarraVox não cria cadastros nem exige login. No modo gratuito, tudo
              acontece no seu navegador. No modo neural, seu texto é transmitido à
              Microsoft para gerar o áudio — e devolvido imediatamente. Nada é
              armazenado fora do seu dispositivo.
            </p>
          </section>

          {/* Dois modos de TTS */}
          <section>
            <h2 style={S.h2}>Dois modos de síntese — dois comportamentos de privacidade</h2>

            <div style={{ marginBottom: 14 }}>
              <span style={S.badge("green")}>Modo Navegador (gratuito)</span>
              <p style={{ ...S.p, marginTop: 8 }}>
                A síntese de voz usa a API nativa do seu navegador (Web Speech API).
                O texto <strong>nunca sai do seu dispositivo</strong>. Nenhum dado é
                transmitido a servidores. Privacidade total.
              </p>
            </div>

            <div>
              <span style={S.badge("blue")}>Modo Neural (Edge TTS)</span>
              <p style={{ ...S.p, marginTop: 8 }}>
                Ao usar vozes neurais, o texto é enviado ao servidor NarraVox
                (hospedado na Vercel), que o repassa à infraestrutura de síntese de
                voz da Microsoft (Edge TTS). O áudio gerado é devolvido ao seu
                navegador. <strong>Nenhum texto é armazenado</strong> pelo NarraVox
                ou pela Microsoft além do tempo de geração do áudio.
              </p>
              <p style={{ ...S.p, marginTop: 10 }}>
                Fluxo:{" "}
                <strong>
                  navegador → servidor NarraVox → Microsoft Edge TTS → áudio de volta.
                </strong>
              </p>
            </div>
          </section>

          {/* Importação de arquivos */}
          <section>
            <h2 style={S.h2}>Importação de arquivos (.txt e .pdf)</h2>
            <p style={S.p}>
              O processamento de arquivos acontece <strong>100% no seu navegador</strong>,
              usando FileReader (TXT) e pdf.js (PDF). O arquivo nunca é enviado a
              nenhum servidor durante a importação. Apenas o texto extraído pode ser
              transmitido ao Edge TTS se você usar o modo neural.
            </p>
          </section>

          {/* localStorage */}
          <section>
            <h2 style={S.h2}>O que fica salvo no seu dispositivo</h2>
            <p style={S.p}>
              O histórico de leituras é salvo no{" "}
              <code style={S.code}>localStorage</code> do seu navegador. Cada item
              armazena: o texto completo (até 100 mil caracteres), o título, a
              contagem de palavras, a posição de retomada, a velocidade usada e — no
              caso de PDFs — a página ativa. Esses dados existem{" "}
              <strong>apenas no seu dispositivo</strong> e nunca são sincronizados
              com servidores. Você pode apagá-los a qualquer momento pelo botão
              "Limpar histórico" no painel lateral, ou limpando os dados do site nas
              configurações do navegador.
            </p>
          </section>

          {/* sessionStorage */}
          <section>
            <h2 style={S.h2}>sessionStorage e preferências de sessão</h2>
            <p style={S.p}>
              A estratégia de sincronização de destaque de palavras (por evento de
              boundary ou por estimativa de tempo) é salva no{" "}
              <code style={S.code}>sessionStorage</code> apenas para a sessão atual,
              sendo apagada automaticamente ao fechar o navegador. Nenhum cookie é
              usado. Não há rastreamento, analytics ou pixels de terceiros.
            </p>
          </section>

          {/* Recomendação */}
          <section>
            <h2 style={S.h2}>Recomendação de cuidado</h2>
            <p style={S.p}>
              Evite usar o modo neural com textos que contenham informações pessoais
              sensíveis (dados de saúde, documentos de identidade, senhas, dados
              financeiros). No modo gratuito (navegador), não há transmissão — o
              texto permanece inteiramente no seu dispositivo.
            </p>
          </section>

          {/* Contato */}
          <section>
            <h2 style={S.h2}>Contato</h2>
            <p style={S.p}>
              Dúvidas sobre esta política?{" "}
              <a
                href="mailto:pedrolpompeu@gmail.com"
                style={{ color: "var(--glass)", textDecoration: "none" }}
              >
                pedrolpompeu@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
