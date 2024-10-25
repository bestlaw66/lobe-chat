import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { getLLMConfig } from '@/config/llm';
import { ChatCompletionErrorPayload } from '@/libs/agent-runtime';
import { LobeVertexAI } from '@/libs/agent-runtime/vertexai';
import { createTraceOptions } from '@/server/modules/AgentRuntime';
import { ChatErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';
import { createErrorResponse } from '@/utils/errorResponse';
import { safeParseJSON } from '@/utils/safeParseJSON';
import { getTracePayload } from '@/utils/trace';

const provider = 'vertexai';

export const POST = checkAuth(async (req: Request, { jwtPayload }) => {
  try {
    // ============  1. init chat model   ============ //

    const { VERTEXAI_PROJECT, VERTEXAI_LOCATION, VERTEXAI_CREDENTIALS, VERTEXAI_CREDENTIALS_PATH } =
      getLLMConfig();

    const credentialsContent =
      VERTEXAI_CREDENTIALS ??
      (VERTEXAI_CREDENTIALS_PATH
        ? readFileSync(resolve(process.cwd(), VERTEXAI_CREDENTIALS_PATH), 'utf8')
        : undefined);

    const googleAuthOptions = credentialsContent ? safeParseJSON(credentialsContent) : undefined;
    const agentRuntime = LobeVertexAI.initFromVertexAI({
      googleAuthOptions: googleAuthOptions,
      location: VERTEXAI_LOCATION,
      project: VERTEXAI_PROJECT,
    });

    // ============  2. create chat completion   ============ //

    const data = (await req.json()) as ChatStreamPayload;

    const tracePayload = getTracePayload(req);

    let traceOptions = {};
    // If user enable trace
    if (tracePayload?.enabled) {
      traceOptions = createTraceOptions(data, {
        provider,
        trace: tracePayload,
      });
    }

    return await agentRuntime.chat(data, { user: jwtPayload.userId, ...traceOptions });
  } catch (e) {
    const {
      errorType = ChatErrorType.InternalServerError,
      error: errorContent,
      ...res
    } = e as ChatCompletionErrorPayload;

    const error = errorContent || e;
    // track the error at server side
    console.error(`Route: [${provider}] ${errorType}:`, error);

    return createErrorResponse(errorType, { error, ...res, provider });
  }
});
