import Image from "next/image";

const members = [
  {
    name: "สมาชิกคนที่ 1",
    role: "นายธนกรณ์ รัศมีจันทร์",
    skills: "Next.js • MongoDB • Tailwind CSS • API • UX",
   image: "https://res.cloudinary.com/ngbreuxn/image/upload/v1789612342/member2.png.png"
  },
  {
    name: "สมาชิกคนที่ 2",
    role: "นายฐิติพันธ์ รักษ์แสงสว่าง",
    skills: "Design • UI • API • UX",
    image: "https://res.cloudinary.com/ngbreuxn/image/upload/v1789613566/Screenshot_20260917_095035_Gallery.png"
  },
  {
    name: "สมาชิกคนที่ 3",
    role: "นายศุภณัฐ เกริกชัยวัน",
    skills: "UI • Design • UX",
    image:"https://res.cloudinary.com/ngbreuxn/image/upload/v1789613569/1789613475797.jpg"
  },
];

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">
          ทีมงาน Mickey Blog
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          พบกับทีมงานผู้สร้างสรรค์เว็บไซต์และเนื้อหาของ Mickey Blog
        </p>
      </section>

      {/* About Team */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            เกี่ยวกับทีมงาน
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-gray-600">
            ทีมงานของเราร่วมกันพัฒนาเว็บไซต์ สร้างสรรค์เนื้อหา
            และพัฒนาโปรเจกต์ด้านเทคโนโลยี
          </p>
        </div>

        {/* Team Members */}
        <div className="grid gap-8 md:grid-cols-3">
          {members.map((member) => (
            <div
              key={member.name}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Profile Image */}
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Member Information */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {member.name}
                </h3>

                <p className="mt-2 font-medium text-purple-600">
                  {member.role}
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {member.skills}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}