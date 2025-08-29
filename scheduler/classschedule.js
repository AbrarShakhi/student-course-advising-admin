class ClassSchedule {
  constructor(students_choices) {
    this.students_choices = students_choices;
  }

  #find_courses() {
    const temp_courses = {};
    const student_entries = Object.entries(this.students_choices);

    for (let i = 0; i < student_entries.length; i++) {
      const student = student_entries[i][0];
      const course_set = student_entries[i][1];

      for (const course of course_set) {
        if (!temp_courses[course]) {
          temp_courses[course] = [];
        }
        temp_courses[course].push(student);
      }
    }

    return temp_courses;
  }

  make_section(max_enroll = 30) {
    this.courses = {};
    const course_entries = Object.entries(this.#find_courses());

    for (let i = 0; i < course_entries.length; i++) {
      const course = course_entries[i][0];
      const students = course_entries[i][1];

      this.courses[course] = [];

      for (let j = 0; j < students.length; j += max_enroll) {
        const section_students = students.slice(j, j + max_enroll);

        this.courses[course].push({
          students: section_students,
          schedule: null,
        });
      }
    }
  }

  validate_time_slot(slot) {
    const valid_days = ["SAT", "SUN", "MON", "TUE", "WED", "THR", "FRI"];
    const start_time = slot.start_time;
    const end_time = slot.end_time;
    const day = slot.day;

    if (!valid_days.includes(day)) {
      throw new Error("Invalid day: " + day);
    }

    if (!this.is_valid_time(start_time)) {
      throw new Error("Invalid start_time format: " + start_time);
    }

    if (!this.is_valid_time(end_time)) {
      throw new Error("Invalid end_time format: " + end_time);
    }

    if (start_time >= end_time) {
      throw new Error("start_time must be before end_time for slot on " + day);
    }
  }

  is_valid_time(time) {
    const time_pattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    return time_pattern.test(time);
  }

  make_schedule(time_slots, max_generations = 100, population_size = 20) {
    for (let i = 0; i < time_slots.length; i++) {
      this.validate_time_slot(time_slots[i]);
    }

    const all_sections = [];

    for (const course in this.courses) {
      for (let i = 0; i < this.courses[course].length; i++) {
        all_sections.push({ course, index: i });
      }
    }

    const population = [];

    // --- Generate initial population ---
    for (let p = 0; p < population_size; p++) {
      const chromosome = {};
      for (let i = 0; i < all_sections.length; i++) {
        const section = all_sections[i];
        const random_index = Math.floor(Math.random() * time_slots.length);
        chromosome[section.course + "-" + section.index] =
          time_slots[random_index];
      }
      population.push(chromosome);
    }

    let best_schedule = null;
    let best_fitness = Infinity;

    for (let generation = 0; generation < max_generations; generation++) {
      const fitness_scores = population.map((chromosome) =>
        this.calculate_fitness(chromosome)
      );

      // Find best in this generation
      for (let i = 0; i < population.length; i++) {
        if (fitness_scores[i] < best_fitness) {
          best_fitness = fitness_scores[i];
          best_schedule = population[i];
        }
      }

      if (best_fitness === 0) {
        break; // Found a conflict-free schedule
      }

      // --- Selection ---
      const selected = this.select_top_schedules(
        population,
        fitness_scores,
        population_size / 2
      );

      // --- Crossover + Mutation to create new population ---
      const new_population = [];

      while (new_population.length < population_size) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)];
        const parent2 = selected[Math.floor(Math.random() * selected.length)];
        const child = this.crossover(
          parent1,
          parent2,
          all_sections,
          time_slots
        );
        this.mutate(child, all_sections, time_slots, 0.1); // 10% mutation rate
        new_population.push(child);
      }

      population.length = 0;
      for (let i = 0; i < new_population.length; i++) {
        population.push(new_population[i]);
      }
    }

    if (best_schedule === null) {
      throw new Error("Failed to generate valid schedule");
    }

    // --- Apply best_schedule to actual course sections ---
    for (const key in best_schedule) {
      const [course, idx_str] = key.split("-");
      const index = parseInt(idx_str);
      this.courses[course][index].schedule = best_schedule[key];
    }

    return this.courses;
  }
  calculate_fitness(chromosome) {
    const student_schedules = {};
    let conflict_count = 0;

    for (const course in this.courses) {
      for (let i = 0; i < this.courses[course].length; i++) {
        const section = this.courses[course][i];
        const slot = chromosome[course + "-" + i];

        for (let j = 0; j < section.students.length; j++) {
          const student = section.students[j];

          if (!student_schedules[student]) {
            student_schedules[student] = [];
          }

          for (let k = 0; k < student_schedules[student].length; k++) {
            const s = student_schedules[student][k];
            if (
              s.day === slot.day &&
              !(s.end_time <= slot.start_time || s.start_time >= slot.end_time)
            ) {
              conflict_count += 1;
              break;
            }
          }

          student_schedules[student].push(slot);
        }
      }
    }

    return conflict_count;
  }

  select_top_schedules(population, fitness_scores, count) {
    const paired = population.map((chromosome, i) => ({
      chromosome,
      fitness: fitness_scores[i],
    }));

    paired.sort((a, b) => a.fitness - b.fitness);

    return paired.slice(0, count).map((p) => p.chromosome);
  }

  crossover(parent1, parent2, all_sections, time_slots) {
    const child = {};

    for (let i = 0; i < all_sections.length; i++) {
      const section = all_sections[i];
      const key = section.course + "-" + section.index;
      child[key] = Math.random() < 0.5 ? parent1[key] : parent2[key];
    }

    return child;
  }

  mutate(chromosome, all_sections, time_slots, rate = 0.1) {
    for (let i = 0; i < all_sections.length; i++) {
      if (Math.random() < rate) {
        const section = all_sections[i];
        const key = section.course + "-" + section.index;
        const new_slot =
          time_slots[Math.floor(Math.random() * time_slots.length)];
        chromosome[key] = new_slot;
      }
    }
  }
}

export default ClassSchedule;

const students_choices = {
  234: new Set(["Math", "Physics"]),
  235: new Set(["Math", "Chemistry"]),
  236: new Set(["Physics", "Chemistry"]),
  237: new Set(["Math", "Chemistry"]),
  238: new Set(["Math", "Physics"]),
  239: new Set(["Math"]),
};

const time_slots = [
  { day: "MON", start_time: "09:00", end_time: "10:30" },
  { day: "TUE", start_time: "10:30", end_time: "12:00" },
  { day: "WED", start_time: "13:00", end_time: "14:30" },
  { day: "THR", start_time: "09:00", end_time: "10:30" },
  { day: "FRI", start_time: "10:30", end_time: "12:00" },
  { day: "SAT", start_time: "13:00", end_time: "14:30" },
];

const schedule = new ClassSchedule(students_choices);

schedule.make_section(2);

const result = schedule.make_schedule(time_slots);

console.log(JSON.stringify(result, null, 2));
