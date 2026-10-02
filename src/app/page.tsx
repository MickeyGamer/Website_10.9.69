import Link from "next/link";

const features = [
  {
    icon: "💻",
    title: "Web Development",
    description:
      "เรียนรู้การพัฒนาเว็บไซต์ และเทคโนโลยีสมัยใหม่",
    color: "bg-blue-50",
  },
  {
    icon: "🚀",
    title: "Technology",
    description:
      "ติดตามความรู้และประสบการณ์ด้านเทคโนโลยีและ IT",
    color: "bg-purple-50",
  },
  {
    icon: "👥",
    title: "Community",
    description:
      "แลกเปลี่ยนความรู้และพูดคุยกับคนที่สนใจด้าน IT",
    color: "bg-green-50",
  },
];

const stats = [
  {
    value: "100+",
    label: "บทความ",
  },
  {
    value: "50+",
    label: "หัวข้อความรู้",
  },
  {
    value: "24/7",
    label: "เปิดให้เข้าชม",
  },
  {
    value: "IT",
    label: "เนื้อหาหลัก",
  },
];

const articles = [
  {
    category: "Web Development",
    title: "เริ่มต้นพัฒนาเว็บไซต์ด้วย Next.js",
    description:
      "ทำความรู้จักกับแนวคิดพื้นฐานของ Next.js และการสร้างเว็บไซต์สมัยใหม่",
    href: "/blog",
  },
  {
    category: "Programming",
    title: "พื้นฐานการเขียนโปรแกรม",
    description:
      "เรียนรู้แนวคิดสำคัญสำหรับผู้เริ่มต้นเขียนโปรแกรม",
    href: "/blog",
  },
  {
    category: "Technology",
    title: "เทคโนโลยีที่น่าสนใจ",
    description:
      "รวบรวมเรื่องราวและประสบการณ์เกี่ยวกับเทคโนโลยี",
    href: "/blog",
  },
];

export default function HomePage() {
  return (
    <section className="flex-1">

      {/* =====================================================
          HERO
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-gray-100
            bg-white
            p-8
            shadow-sm
            sm:p-12
            lg:p-16
          "
        >
          {/* Background decoration */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-64
              w-64
              rounded-full
              bg-blue-100/50
              blur-3xl
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-32
              right-20
              h-72
              w-72
              rounded-full
              bg-purple-100/40
              blur-3xl
            "
          />

          <div className="relative max-w-3xl">

            <span
              className="
                inline-flex
                items-center
                rounded-full
                bg-blue-50
                px-3
                py-1.5
                text-sm
                font-semibold
                text-blue-600
              "
            >
              👋 Welcome to Mickey Hub
            </span>

            <h1
              className="
                mt-5
                text-4xl
                font-black
                tracking-tight
                text-gray-900
                sm:text-5xl
                lg:text-6xl
                lg:leading-[1.1]
              "
            >
              แบ่งปันความรู้
              <br />
              <span className="text-blue-600">
                ด้าน IT และเทคโนโลยี
              </span>
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-8
                text-gray-500
                sm:text-lg
              "
            >
              แหล่งรวมบทความ ความรู้ ประสบการณ์
              และเรื่องราวเกี่ยวกับการพัฒนาเว็บไซต์
              เทคโนโลยี และการเขียนโปรแกรม
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/blog"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-900
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-gray-800
                  hover:shadow-md
                  active:scale-[0.98]
                "
              >
                อ่านบทความ
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/team"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-gray-700
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-gray-50
                  hover:border-gray-300
                  active:scale-[0.98]
                "
              >
                รู้จักทีมงาน
              </Link>

            </div>

          </div>
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-5
                text-center
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-md
              "
            >
              <p className="text-2xl font-black text-gray-900">
                {stat.value}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}

        </div>

        {/* =====================================================
            FEATURES
        ====================================================== */}

        <div className="mt-16">

          <div className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Explore
            </span>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900">
              เรียนรู้ไปด้วยกัน
            </h2>

            <p className="mt-3 text-gray-500">
              สำรวจเนื้อหาและพื้นที่ต่าง ๆ ของ Mickey Hub
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {features.map((feature) => (
              <div
                key={feature.title}
                className="
                  group
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    text-xl
                    ${feature.color}
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  `}
                >
                  {feature.icon}
                </div>

                <h3 className="mt-5 font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}

          </div>
        </div>

        {/* =====================================================
            ARTICLES
        ====================================================== */}

        <div className="mt-20">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Blog
              </span>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                บทความน่าสนใจ
              </h2>

              <p className="mt-3 text-gray-500">
                เรื่องราวและความรู้ที่น่าสนใจจาก Mickey Hub
              </p>
            </div>

            <Link
              href="/blog"
              className="
                text-sm
                font-semibold
                text-blue-600
                transition-colors
                hover:text-blue-700
              "
            >
              ดูบทความทั้งหมด →
            </Link>

          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            {articles.map((article) => (
              <Link
                key={article.title}
                href={article.href}
                className="
                  group
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >
                <span className="text-xs font-bold text-blue-600">
                  {article.category}
                </span>

                <h3
                  className="
                    mt-3
                    text-lg
                    font-bold
                    text-gray-900
                    transition-colors
                    group-hover:text-blue-600
                  "
                >
                  {article.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {article.description}
                </p>

                <span className="mt-5 inline-block text-sm font-semibold text-gray-700">
                  อ่านเพิ่มเติม →
                </span>
              </Link>
            ))}

          </div>
        </div>

        {/* =====================================================
            COMMUNITY CTA
        ====================================================== */}

        <div className="mt-20">

          <div
            className="
              overflow-hidden
              rounded-3xl
              bg-gray-900
              p-8
              text-white
              sm:p-10
              lg:p-12
            "
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <span className="text-sm font-bold uppercase tracking-wider text-blue-300">
                  Community
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  มีคำถามหรืออยากพูดคุย?
                </h2>

                <p className="mt-4 leading-7 text-gray-300">
                  เข้ามาพูดคุย แลกเปลี่ยนความคิดเห็น
                  และแบ่งปันประสบการณ์กับ Community
                  ของ Mickey Hub
                </p>

              </div>

              <Link
                href="/board"
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-gray-900
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-gray-100
                  active:scale-[0.98]
                "
              >
                เข้าสู่เว็บบอร์ด
                <span className="ml-2">→</span>
              </Link>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
