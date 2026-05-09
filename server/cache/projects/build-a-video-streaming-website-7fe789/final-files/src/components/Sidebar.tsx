import { Link } from 'react-router-dom';
import { CATEGORIES } from '../utils/constants';

const Sidebar = () => (
  <aside className="bg-gray-950 text-white w-64 p-4 hidden md:block">
    <nav className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold mb-2">Categories</h2>
      {(CATEGORIES ?? []).map(category => (
        <Link
          key={category.id}
          to={category.path}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
