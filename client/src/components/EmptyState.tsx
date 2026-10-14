interface Props {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      {action && (
        <button type="button" className="btn btn-primary mt-5" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
