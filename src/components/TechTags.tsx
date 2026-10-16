import type { IconType } from 'react-icons';
import {
  SiArduino,
  SiC,
  SiCplusplus,
  SiCisco,
  SiCss,
  SiDjango,
  SiDocker,
  SiFastapi,
  SiFlask,
  SiGit,
  SiGithub,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiKubernetes,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedis,
  SiRust,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
  SiYoutube,
  SiAngular,
  SiPytorch,
  SiVuedotjs,
} from 'react-icons/si';
import { Code2 } from 'lucide-react';

type TagBrand = { icon: IconType; color: string; url: string };

const tagIcons: Record<string, TagBrand> = {
  arduino: { icon: SiArduino, color: '#00979D', url: 'https://www.arduino.cc/' },
  c: { icon: SiC, color: '#A8B9CC', url: 'https://en.cppreference.com/w/c/language.html' },
  cpp: { icon: SiCplusplus, color: '#00599C', url: 'https://isocpp.org/' },
  cplusplus: { icon: SiCplusplus, color: '#00599C', url: 'https://isocpp.org/' },
  cisco: { icon: SiCisco, color: '#1BA0D7', url: 'https://www.cisco.com/' },
  css: { icon: SiCss, color: '#1572B6', url: 'https://developer.mozilla.org/docs/Web/CSS' },
  django: { icon: SiDjango, color: '#092E20', url: 'https://www.djangoproject.com/' },
  docker: { icon: SiDocker, color: '#2496ED', url: 'https://www.docker.com/' },
  fastapi: { icon: SiFastapi, color: '#009688', url: 'https://fastapi.tiangolo.com/' },
  flask: { icon: SiFlask, color: '#333333', url: 'https://flask.palletsprojects.com/' },
  git: { icon: SiGit, color: '#F05032', url: 'https://git-scm.com/' },
  github: { icon: SiGithub, color: '#24292F', url: 'https://github.com/' },
  go: { icon: SiGo, color: '#00ADD8', url: 'https://go.dev/' },
  golang: { icon: SiGo, color: '#00ADD8', url: 'https://go.dev/' },
  html: { icon: SiHtml5, color: '#E34F26', url: 'https://developer.mozilla.org/docs/Web/HTML' },
  angular: { icon: SiAngular, color: '#DD0031', url: 'https://angular.dev/' },
  javascript: { icon: SiJavascript, color: '#C9A900', url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  js: { icon: SiJavascript, color: '#C9A900', url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  kubernetes: { icon: SiKubernetes, color: '#326CE5', url: 'https://kubernetes.io/' },
  k8s: { icon: SiKubernetes, color: '#326CE5', url: 'https://kubernetes.io/' },
  linux: { icon: SiLinux, color: '#E0A800', url: 'https://www.kernel.org/' },
  mongodb: { icon: SiMongodb, color: '#47A248', url: 'https://www.mongodb.com/' },
  mongo: { icon: SiMongodb, color: '#47A248', url: 'https://www.mongodb.com/' },
  mysql: { icon: SiMysql, color: '#4479A1', url: 'https://www.mysql.com/' },
  node: { icon: SiNodedotjs, color: '#5FA04E', url: 'https://nodejs.org/' },
  nodejs: { icon: SiNodedotjs, color: '#5FA04E', url: 'https://nodejs.org/' },
  php: { icon: SiPhp, color: '#777BB4', url: 'https://www.php.net/' },
  postgresql: { icon: SiPostgresql, color: '#4169E1', url: 'https://www.postgresql.org/' },
  postgres: { icon: SiPostgresql, color: '#4169E1', url: 'https://www.postgresql.org/' },
  python: { icon: SiPython, color: '#3776AB', url: 'https://www.python.org/' },
  pytorch: { icon: SiPytorch, color: '#EE4C2C', url: 'https://pytorch.org/' },
  react: { icon: SiReact, color: '#149ECA', url: 'https://react.dev/' },
  redis: { icon: SiRedis, color: '#DC382D', url: 'https://redis.io/' },
  rust: { icon: SiRust, color: '#CE422B', url: 'https://www.rust-lang.org/' },
  tailwind: { icon: SiTailwindcss, color: '#06B6D4', url: 'https://tailwindcss.com/' },
  tailwindcss: { icon: SiTailwindcss, color: '#06B6D4', url: 'https://tailwindcss.com/' },
  tensorflow: { icon: SiTensorflow, color: '#FF6F00', url: 'https://www.tensorflow.org/' },
  typescript: { icon: SiTypescript, color: '#3178C6', url: 'https://www.typescriptlang.org/' },
  ts: { icon: SiTypescript, color: '#3178C6', url: 'https://www.typescriptlang.org/' },
  vue: { icon: SiVuedotjs, color: '#4FC08D', url: 'https://vuejs.org/' },
  vuedotjs: { icon: SiVuedotjs, color: '#4FC08D', url: 'https://vuejs.org/' },
  youtube: { icon: SiYoutube, color: '#FF0000', url: 'https://www.youtube.com/' },
};

export function TechTags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <div className="chip-list" aria-label="Technology tags">
      <Code2 className="tag-list-icon" size={14} aria-hidden="true" />
      {tags.map((tag) => {
        const normalized = tag.trim().toLowerCase();
        const key = normalized === 'c++'
          ? 'cplusplus'
          : normalized === 'c#'
            ? 'csharp'
            : normalized.replace(/[^a-z0-9]/g, '');
        const brand = tagIcons[key];
        const Icon = brand?.icon;
        const color = brand?.color ?? '#7057C8';
        const url = brand?.url ?? `https://www.google.com/search?q=${encodeURIComponent(`${tag} official documentation`)}`;

        return (
          <a
            key={tag}
            className="chip"
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={brand ? `Open ${tag} official website` : `Search for ${tag} official documentation`}
            title={brand ? `Official ${tag} website` : `Search ${tag} official documentation`}
          >
            {Icon ? (
              <Icon className="tag-symbol" size={13} style={{ color }} aria-hidden="true" />
            ) : (
              <Code2 className="tag-symbol" size={13} style={{ color }} aria-hidden="true" />
            )}
            <span className="tag-hash">#</span>{tag}
          </a>
        );
      })}
    </div>
  );
}
