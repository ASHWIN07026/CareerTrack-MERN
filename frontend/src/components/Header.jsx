import Icon from './Icon.jsx';

export default function Header({ onAdd }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <span className="brand-logo"><Icon name="briefcase" size={20} /></span>
          <div>
            <h1>CareerTrack</h1>
            <p>Job application tracker</p>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={onAdd} aria-label="Add application">
          <Icon name="plus" /> <span>Add application</span>
        </button>
      </div>
    </header>
  );
}
