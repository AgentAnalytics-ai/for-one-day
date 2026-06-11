import Link from 'next/link'

export function ListsUpgradeBanner() {
  return (
    <div className="rounded-2xl border border-primary-200 bg-primary-50/80 px-5 py-4 text-center sm:text-left">
      <p className="font-medium text-primary-900">Shared lists are a Pro household feature</p>
      <p className="mt-1 text-sm text-[#5C6478]">
        One plan for your home — groceries and to-dos sync between kitchen wall and phones. Spouse
        included.
      </p>
      <Link
        href="/upgrade"
        className="mt-3 inline-flex rounded-full bg-primary-800 px-4 py-2 text-sm font-medium text-white hover:bg-primary-900"
      >
        Upgrade your household
      </Link>
    </div>
  )
}
