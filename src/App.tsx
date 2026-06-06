import { useMemo, useState } from "react";
import { campaignTypes } from "./data/options";
import { regionProfiles } from "./data/regions";
import { generatePerson, generatePersonBatch } from "./lib/generator";
import type { AgeGroup, CampaignType, GenderPresentation, RegionProfileId } from "./types";

const ageOptions: Array<{ id: AgeGroup | "random"; label: string }> = [
  { id: "random", label: "Random" },
  { id: "child", label: "Child" },
  { id: "teen", label: "Teen" },
  { id: "young_adult", label: "Young adult" },
  { id: "adult", label: "Adult" },
  { id: "middle_aged", label: "Middle aged" },
  { id: "senior", label: "Senior" },
  { id: "elderly", label: "Elderly" }
];

const genderOptions: Array<{ id: GenderPresentation | "random"; label: string }> = [
  { id: "random", label: "Random" },
  { id: "female_presenting", label: "Female presenting" },
  { id: "male_presenting", label: "Male presenting" },
  { id: "androgynous", label: "Androgynous" },
  { id: "non_binary_presenting", label: "Non-binary presenting" }
];

const batchCountOptions = [100, 500, 1000] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  }

  return (
    <button className="secondary" onClick={copy}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function App() {
  const [region, setRegion] = useState<RegionProfileId | "random">("random");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "random">("random");
  const [gender, setGender] = useState<GenderPresentation | "random">("random");
  const [campaign, setCampaign] = useState<CampaignType>("generic_casting");
  const [seed, setSeed] = useState(0);
  const [batchCount, setBatchCount] = useState<(typeof batchCountOptions)[number]>(100);
  const [promptList, setPromptList] = useState("");
  const [batchStatus, setBatchStatus] = useState("");
  const isFullyRandom = region === "random" && ageGroup === "random" && gender === "random";

  const person = useMemo(() => {
    seed;
    return generatePerson({
      regionProfile: region,
      ageGroup,
      genderPresentation: gender,
      campaignType: campaign
    });
  }, [region, ageGroup, gender, campaign, seed]);

  async function generatePersonList() {
    const prompts = generatePersonBatch({
      count: batchCount,
      regionProfile: region,
      ageGroup,
      genderPresentation: gender,
      campaignType: campaign
    }).map(person => person.prompt_description.replace(/\s+/g, " ").trim());
    const output = prompts.join("\n");

    setPromptList(output);

    try {
      await navigator.clipboard.writeText(output);
      setBatchStatus(
        isFullyRandom
          ? `${batchCount} prompts generated, balanced for full-random mode, and copied.`
          : `${batchCount} prompts generated and copied.`
      );
    } catch {
      setBatchStatus(
        isFullyRandom
          ? `${batchCount} prompts generated in balanced full-random mode. Copy manually below.`
          : `${batchCount} prompts generated. Copy manually below.`
      );
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>AI Casting Headshot Generator</h1>
          <p>Data-driven photorealistic person profiles → prompt + negative prompt.</p>
        </div>

        <div className="topbarActions">
          <label className="compactLabel">
            List size
            <select value={batchCount} onChange={event => setBatchCount(Number(event.target.value) as (typeof batchCountOptions)[number])}>
              {batchCountOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button className="primary" onClick={() => setSeed(value => value + 1)}>
            Generate person
          </button>

          <button className="secondary" onClick={generatePersonList}>
            Generate person list
          </button>
        </div>
      </header>

      <section className="layout">
        <aside className="panel controls">
          <h2>Generator</h2>

          <label>
            Region profile
            <select value={region} onChange={event => setRegion(event.target.value as RegionProfileId | "random")}>
              <option value="random">Random global</option>
              {regionProfiles.map(region => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Age group
            <select value={ageGroup} onChange={event => setAgeGroup(event.target.value as AgeGroup | "random")}>
              {ageOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Gender presentation
            <select value={gender} onChange={event => setGender(event.target.value as GenderPresentation | "random")}>
              {genderOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Campaign type
            <select value={campaign} onChange={event => setCampaign(event.target.value as CampaignType)}>
              {campaignTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <div className="note">
            V1 gebruikt region-weighted visual probabilities, maar geen harde stereotypes. Bij Random global gebruikt de generator nu een neutralere mix in plaats van een impliciete regio-bias.
          </div>

          <div className="batchPanel">
            <div className="panelHeader">
              <h3>Batch prompt list</h3>
              {promptList ? <CopyButton text={promptList} /> : null}
            </div>

            <p className="batchStatus">
              {batchStatus || (
                isFullyRandom
                  ? `Genereert ${batchCount} prompts in balanced full-random mode om scheve streaks te beperken.`
                  : `Genereert ${batchCount} prompts op basis van de huidige filters.`
              )}
            </p>
            <textarea
              className="batchOutput"
              value={promptList}
              readOnly
              placeholder="Hier verschijnt de promptlijst. Elke prompt staat op één regel zonder interne enters."
            />
          </div>
        </aside>

        <section className="panel profile">
          <div className="panelHeader">
            <h2>Generated profile</h2>
            <CopyButton text={JSON.stringify(person, null, 2)} />
          </div>

          <div className="profileGrid">
            <div>
              <h3>Identity</h3>
              <dl>
                <dt>Name</dt><dd>{person.display_name}</dd>
                <dt>Age</dt><dd>{person.age} / {person.age_group}</dd>
                <dt>Gender</dt><dd>{person.gender_presentation}</dd>
                <dt>Origin</dt><dd>{person.cultural_background}</dd>
                <dt>Languages</dt><dd>{person.languages.join(", ")}</dd>
                <dt>Socioeconomic</dt><dd>{person.socioeconomic_context}</dd>
                <dt>Profession</dt><dd>{person.profession_category}</dd>
              </dl>
            </div>

            <div>
              <h3>Visual morphology</h3>
              <dl>
                {Object.entries(person.visual).map(([key, value]) => (
                  <div className="dlRow" key={key}>
                    <dt>{key}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <aside className="panel prompt">
          <div className="panelHeader">
            <h2>Prompt</h2>
            <CopyButton text={person.prompt_description} />
          </div>

          <textarea value={person.prompt_description} readOnly />

          <div className="panelHeader">
            <h2>Negative prompt</h2>
            <CopyButton text={person.negative_prompt} />
          </div>

          <textarea className="negative" value={person.negative_prompt} readOnly />
        </aside>
      </section>
    </main>
  );
}
