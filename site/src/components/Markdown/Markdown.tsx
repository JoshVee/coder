import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { type Interpolation, type Theme } from "@emotion/react";
import isEqual from "lodash/isEqual";
import { type FC, memo } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import gfm from "remark-gfm";
import { colors } from "theme/colors";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface MarkdownProps {
  /**
   * The Markdown text to parse and render
   */
  children: string;

  className?: string;

  /**
   * Can override the behavior of the generated elements
   */
  components?: Options["components"];
}

export const Markdown: FC<MarkdownProps> = (props) => {
  const { children, className, components = {} } = props;

  return (
    <ReactMarkdown
      css={markdownStyles}
      className={className}
      remarkPlugins={[gfm]}
      components={{
        a: ({ href, target, children }) => (
          <Link href={href} target={target}>
            {children}
          </Link>
        ),

        pre: ({ node, children }) => {
          const firstChild = node.children[0];
          // When pre is wrapping a code, the SyntaxHighlighter is already going
          // to wrap it with a pre so we don't need it
          if (firstChild.type === "element" && firstChild.tagName === "code") {
            return <>{children}</>;
          }
          return <pre>{children}</pre>;
        },

        code: ({ node, inline, className, children, style, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <SyntaxHighlighter
              style={darcula}
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this can be undefined
              language={match[1].toLowerCase() ?? "language-shell"}
              useInlineStyles={false}
              // Use inline styles does not work correctly
              // https://github.com/react-syntax-highlighter/react-syntax-highlighter/issues/329
              codeTagProps={{ style: {} }}
              {...props}
            >
              {String(children)}
            </SyntaxHighlighter>
          ) : (
            <code
              css={(theme) => ({
                padding: "1px 4px",
                background: theme.palette.divider,
                borderRadius: 4,
                color: theme.palette.text.primary,
                fontSize: 14,
              })}
              {...props}
            >
              {children}
            </code>
          );
        },

        table: ({ children }) => {
          return (
            <TableContainer>
              <Table>{children}</Table>
            </TableContainer>
          );
        },

        tr: ({ children }) => {
          return <TableRow>{children}</TableRow>;
        },

        thead: ({ children }) => {
          return <TableHead>{children}</TableHead>;
        },

        tbody: ({ children }) => {
          return <TableBody>{children}</TableBody>;
        },

        td: ({ children }) => {
          return <TableCell>{children}</TableCell>;
        },

        th: ({ children }) => {
          return <TableCell>{children}</TableCell>;
        },

        ...components,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

interface MarkdownInlineProps {
  /**
   * The Markdown text to parse and render
   */
  children: string;

  className?: string;

  /**
   * Can override the behavior of the generated elements
   */
  components?: Options["components"];
}

/**
 * Supports a strict subset of Markdown that bahaves well as inline/confined content.
 */
export const InlineMarkdown: FC<MarkdownInlineProps> = (props) => {
  const { children, className, components = {} } = props;

  return (
    <ReactMarkdown
      className={className}
      allowedElements={["p", "em", "strong", "a", "pre", "code"]}
      unwrapDisallowed
      components={{
        p: ({ children }) => <>{children}</>,

        a: ({ href, target, children }) => (
          <Link href={href} target={target}>
            {children}
          </Link>
        ),

        code: ({ node, className, children, style, ...props }) => (
          <code
            css={(theme) => ({
              padding: "1px 4px",
              background: theme.palette.divider,
              borderRadius: 4,
              color: theme.palette.text.primary,
              fontSize: 14,
            })}
            {...props}
          >
            {children}
          </code>
        ),

        ...components,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export const MemoizedMarkdown = memo(Markdown, isEqual);
export const MemoizedInlineMarkdown = memo(InlineMarkdown, isEqual);

const markdownStyles: Interpolation<Theme> = (theme: Theme) => ({
  fontSize: 16,
  lineHeight: "24px",

  "& h1, & h2, & h3, & h4, & h5, & h6": {
    marginTop: 32,
    marginBottom: 16,
    lineHeight: "1.25",
  },

  "& p": {
    marginTop: 0,
    marginBottom: 16,
  },

  "& p:only-child": {
    marginTop: 0,
    marginBottom: 0,
  },

  "& ul, & ol": {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },

  "& li > ul, & li > ol": {
    marginTop: 16,
  },

  "& li > p": {
    marginBottom: 0,
  },

  "& .prismjs": {
    background: theme.palette.background.paperLight,
    borderRadius: 8,
    padding: "16px 24px",
    overflowX: "auto",

    "& code": {
      color: theme.palette.text.secondary,
    },

    "& .key, & .property, & .inserted, .keyword": {
      color: colors.turquoise[7],
    },

    "& .deleted": {
      color: theme.palette.error.light,
    },
  },
});
