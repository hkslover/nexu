import type { CreateSessionInput, UpdateSessionInput } from "@nexu/shared";
import type { SessionsRuntime } from "../runtime/sessions-runtime.js";
import type { ArtifactService } from "./artifact-service.js";

export class SessionService {
  constructor(
    private readonly sessionsRuntime: SessionsRuntime,
    private readonly artifactService?: ArtifactService,
  ) {}

  async listSessions(params: {
    limit: number;
    offset: number;
    botId?: string;
    channelType?: string;
    status?: string;
  }) {
    let sessions = await this.sessionsRuntime.listSessions();

    if (params.botId) {
      sessions = sessions.filter((session) => session.botId === params.botId);
    }
    if (params.channelType) {
      sessions = sessions.filter(
        (session) => session.channelType === params.channelType,
      );
    }
    if (params.status) {
      sessions = sessions.filter((session) => session.status === params.status);
    }

    return {
      sessions: sessions.slice(params.offset, params.offset + params.limit),
      total: sessions.length,
      limit: params.limit,
      offset: params.offset,
    };
  }

  async getSession(id: string) {
    return this.sessionsRuntime.getSession(id);
  }

  async createSession(input: CreateSessionInput) {
    return this.sessionsRuntime.createOrUpdateSession(input);
  }

  async updateSession(id: string, input: UpdateSessionInput) {
    return this.sessionsRuntime.updateSession(id, input);
  }

  async resetSession(id: string) {
    return this.sessionsRuntime.resetSession(id);
  }

  async deleteSession(id: string) {
    const session = await this.sessionsRuntime.getSession(id);
    if (!session) {
      return false;
    }

    await this.sessionsRuntime.deleteSessionFiles(
      session.botId,
      session.sessionKey,
    );
    await this.artifactService?.deleteArtifactsForSession(
      session.botId,
      session.sessionKey,
    );
    return true;
  }

  async getChatHistory(id: string, limit?: number) {
    return this.sessionsRuntime.getChatHistory(id, limit);
  }
}
