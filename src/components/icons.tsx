import { Bot, Braces, Database, GitFork, Globe, LogIn, UserCheck, type LucideProps } from 'lucide-react';
import type { FC } from 'react';

export const nodeIcons: { [key: string]: FC<LucideProps> } = {
  Input: LogIn,
  LLMCall: Bot,
  HTTP: Globe,
  Parse: Braces,
  Decision: GitFork,
  HumanApprove: UserCheck,
  Storage: Database,
};

export const getNodeIcon = (kind: string) => {
  return nodeIcons[kind] || Bot;
};
