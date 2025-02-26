import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import { useQuery } from "react-query";
import { colors } from "theme/colors";
import {
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "components/HelpTooltip/HelpTooltip";
import { SecondaryAgentButton } from "components/Resources/AgentButton";
import { docs } from "utils/docs";
import { getAgentListeningPorts } from "api/api";
import type {
  WorkspaceAgent,
  WorkspaceAgentListeningPort,
} from "api/typesGenerated";
import { portForwardURL } from "utils/portForward";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "components/Popover/Popover";

export interface PortForwardButtonProps {
  host: string;
  username: string;
  workspaceName: string;
  agent: WorkspaceAgent;
}

export const PortForwardButton: React.FC<PortForwardButtonProps> = (props) => {
  const theme = useTheme();
  const portsQuery = useQuery({
    queryKey: ["portForward", props.agent.id],
    queryFn: () => getAgentListeningPorts(props.agent.id),
    enabled: props.agent.status === "connected",
    refetchInterval: 5_000,
  });

  return (
    <Popover>
      <PopoverTrigger>
        <SecondaryAgentButton disabled={!portsQuery.data}>
          Ports
          {portsQuery.data ? (
            <Box
              sx={{
                fontSize: 12,
                fontWeight: 500,
                height: 20,
                minWidth: 20,
                padding: "0 4px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.gray[11],
                ml: 1,
              }}
            >
              {portsQuery.data.ports.length}
            </Box>
          ) : (
            <CircularProgress size={10} sx={{ ml: 1 }} />
          )}
        </SecondaryAgentButton>
      </PopoverTrigger>
      <PopoverContent
        horizontal="right"
        classes={{
          paper: css`
            padding: 0;
            width: 304px;
            color: ${theme.palette.text.secondary};
            margin-top: 4px;
          `,
        }}
      >
        <PortForwardPopoverView {...props} ports={portsQuery.data?.ports} />
      </PopoverContent>
    </Popover>
  );
};

export const PortForwardPopoverView: React.FC<
  PortForwardButtonProps & { ports?: WorkspaceAgentListeningPort[] }
> = (props) => {
  const theme = useTheme();
  const { host, workspaceName, agent, username, ports } = props;

  return (
    <>
      <Box
        css={{
          padding: 20,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <HelpTooltipTitle>Forwarded ports</HelpTooltipTitle>
        <HelpTooltipText sx={{ color: theme.palette.text.secondary }}>
          {ports?.length === 0
            ? "No open ports were detected."
            : "The forwarded ports are exclusively accessible to you."}
        </HelpTooltipText>
        <Box css={{ marginTop: 12 }}>
          {ports?.map((p) => {
            const url = portForwardURL(
              host,
              p.port,
              agent.name,
              workspaceName,
              username,
            );
            const label = p.process_name !== "" ? p.process_name : p.port;
            return (
              <Link
                underline="none"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.5,
                  fontWeight: 500,
                }}
                key={p.port}
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                <OpenInNewOutlined sx={{ width: 14, height: 14 }} />
                {label}
                <Box
                  component="span"
                  sx={{
                    ml: "auto",
                    color: theme.palette.text.secondary,
                    fontSize: 13,
                    fontWeight: 400,
                  }}
                >
                  {p.port}
                </Box>
              </Link>
            );
          })}
        </Box>
      </Box>

      <Box css={{ padding: 20 }}>
        <HelpTooltipTitle>Forward port</HelpTooltipTitle>
        <HelpTooltipText sx={{ color: theme.palette.text.secondary }}>
          Access ports running on the agent:
        </HelpTooltipText>

        <Box
          component="form"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "4px",
            mt: 2,
            display: "flex",
            alignItems: "center",
            "&:focus-within": {
              borderColor: theme.palette.primary.main,
            },
          }}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const port = Number(formData.get("portNumber"));
            const url = portForwardURL(
              host,
              port,
              agent.name,
              workspaceName,
              username,
            );
            window.open(url, "_blank");
          }}
        >
          <Box
            aria-label="Port number"
            name="portNumber"
            component="input"
            type="number"
            placeholder="Type a port number..."
            min={0}
            max={65535}
            required
            css={{
              fontSize: 14,
              height: 34,
              padding: "0 12px",
              background: "none",
              border: 0,
              outline: "none",
              color: theme.palette.text.primary,
              appearance: "textfield",
              display: "block",
              width: "100%",
            }}
          />
          <OpenInNewOutlined
            css={{
              flexShrink: 0,
              width: 14,
              height: 14,
              marginRight: 12,
              color: theme.palette.text.primary,
            }}
          />
        </Box>

        <HelpTooltipLinksGroup>
          <HelpTooltipLink href={docs("/networking/port-forwarding#dashboard")}>
            Learn more
          </HelpTooltipLink>
        </HelpTooltipLinksGroup>
      </Box>
    </>
  );
};
