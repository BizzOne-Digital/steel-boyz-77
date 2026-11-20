import {
  Award, ClipboardList, Compass, Dumbbell, Flame, Handshake, MessageSquare, MonitorPlay,
  Shield, Star, Target, TrendingUp, Trophy, Users, Zap, type LucideProps,
} from "lucide-react";

/** American football icon (Lucide has no gridiron ball). */
export function FootballIcon(props: LucideProps) {
  const { size = 24, strokeWidth = 2, className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...(rest as React.SVGProps<SVGSVGElement>)}
    >
      <path d="M20.6 3.4c-4.2-.9-9.4.1-12.7 3.4S3.5 15.4 4.4 19.6c4.2.9 9.4-.1 12.7-3.4s4.4-8.6 3.5-12.8Z" />
      <path d="M8.5 15.5l7-7" />
      <path d="M10.5 11.5l2 2M12.5 9.5l2 2M8.5 13.5l2 2" />
      <path d="M15 3.6c.3 2.6 2.8 5.1 5.4 5.4M3.6 15c2.6.3 5.1 2.8 5.4 5.4" />
    </svg>
  );
}

const MAP = {
  football: FootballIcon,
  dumbbell: Dumbbell,
  video: MonitorPlay,
  handshake: Handshake,
  users: Users,
  star: Star,
  shield: Shield,
  target: Target,
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  clipboard: ClipboardList,
  message: MessageSquare,
  trending: TrendingUp,
  compass: Compass,
  award: Award,
} as const;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = MAP[name as keyof typeof MAP] ?? FootballIcon;
  return <C aria-hidden="true" {...props} />;
}
