import { MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { getCategoryAvatar, getInitials } from "../categoryColors";
import { cleanPhone } from "../data";
import type { Provider } from "../types";

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const digits = cleanPhone(provider.phone);
  const tint = getCategoryAvatar(provider.category);
  const initials = getInitials(provider.name);

  return (
    <article className="provider-card">
      <div className="avatar" style={{ background: tint.bg, color: tint.fg }}>
        {initials}
      </div>

      <div className="card-body">
        <h3 className="card-name">{provider.name}</h3>
        <p className="card-meta">
          {provider.category} · {provider.town}
        </p>
        {provider.verified && (
          <span className="badge verified">
            <ShieldCheck size={10} />
            KYC verified
          </span>
        )}
      </div>

      <div className="card-actions">
        <a
          href={`tel:${digits}`}
          className="icon-btn call"
          aria-label={`Call ${provider.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Phone size={16} />
        </a>
        <a
          href={`https://wa.me/91${digits}`}
          target="_blank"
          rel="noreferrer"
          className="icon-btn whatsapp"
          aria-label={`WhatsApp ${provider.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={16} />
        </a>
      </div>
    </article>
  );
}
