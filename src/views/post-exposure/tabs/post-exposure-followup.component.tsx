import React, { useEffect, useState } from "react";
import { EncounterList } from "@ohri/openmrs-esm-ohri-commons-lib";
import {
  INTAKE_A_ENCOUNTER_TYPE,
  MRN_NULL_WARNING,
  POSITIVE_PATIENT_WARNING,
  POST_EXPOSURE_FOLLOWUP_ENCOUNTER_TYPE,
  POST_EXPOSURE_REGISTRATION_ENCOUNTER_TYPE,
  dateOfHIVConfirmation,
  formWarning,
} from "../../../constants";
import { getData } from "../../encounterUtils";
import { moduleName } from "../../../index";
import styles from "../../../root.scss";
import {
  fetchIdentifiers,
  getLatestObs,
  getPatientEncounters,
} from "../../../api/api";

const columns = [
  {
    key: "visitDate",
    header: "Visit Date",
    getValue: (encounter) => {
      return getData(encounter, "163260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", true);
    },
  },
  {
    key: "visitPeriod",
    header: "Visit Period",
    getValue: (encounter) => {
      return getData(encounter, "957a79b4-e771-4ab8-bcc6-e77f7dbcfd9d");
    },
  },
  {
    key: "adherence",
    header: "Adherence",
    getValue: (encounter) => {
      return getData(encounter, "b1a646d3-78ff-4dd5-823a-5bef7d69ff3d");
    },
  },
  {
    key: "hivStatus",
    header: "HIV Status",
    getValue: (encounter) => {
      return getData(encounter, "21ea1d83-acd7-4c99-b4cc-33a90e6dd7d7");
    },
  },
  {
    key: "sideEffect",
    header: "Side Effect",
    getValue: (encounter) => {
      return getData(encounter, "164377AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    },
  },
  {
    key: "remark",
    header: "Remark",
    getValue: (encounter) => {
      return getData(encounter, "161011AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    },
  },
  {
    key: "actions",
    header: "Actions",
    getValue: (encounter) => [
      {
        form: { name: "Post Exposure Followup", package: "eth_hiv" },
        encounterUuid: encounter.uuid,
        intent: "*",
        label: "View Post Exposure Followup",
        mode: "view",
      },
      {
        form: { name: "Post Exposure Followup", package: "eth_hiv" },
        encounterUuid: encounter.uuid,
        intent: "*",
        label: "Edit Post Exposure Followup",
        mode: "edit",
      },
      {
        form: { name: "Post Exposure Followup", package: "eth_hiv" },
        encounterUuid: encounter.uuid,
        intent: "*",
        label: "Delete Post Exposure Followup",
        mode: "delete",
      },
    ],
  },
];

const PostExposureFollowup: React.FC<{ patientUuid: string }> = ({
  patientUuid,
}) => {
  const [hasMRN, setHasMRN] = useState(false);
  const [hasScreeningEncounter, setHasScreeningEncounter] = useState(false);
  const [isConfirmedPositive, setIsConfirmedPositive] = useState(false);

  useEffect(() => {
    (async () => {
      const identifiers = await fetchIdentifiers(patientUuid);
      if (identifiers?.find((e) => e.identifierType.display === "MRN")) {
        setHasMRN(true);
      }
    })();
    (async () => {
      const previousEncounters = await getPatientEncounters(
        patientUuid,
        POST_EXPOSURE_REGISTRATION_ENCOUNTER_TYPE
      );
      if (previousEncounters.length) {
        setHasScreeningEncounter(true);
      }
    })();
    (async () => {
      const positiveConfirmationDate = await getLatestObs(
        patientUuid,
        dateOfHIVConfirmation,
        INTAKE_A_ENCOUNTER_TYPE
      );
      if (positiveConfirmationDate != null) setIsConfirmedPositive(true);
    })();
  });
  return (
    <>
      <EncounterList
        patientUuid={patientUuid}
        encounterType={POST_EXPOSURE_FOLLOWUP_ENCOUNTER_TYPE}
        formList={[{ name: "Post Exposure Followup" }]}
        columns={columns}
        description="Post Exposure Followup List"
        headerTitle="Post Exposure Followup"
        launchOptions={{
          displayText: "Add",
          moduleName: moduleName,
          hideFormLauncher: !hasMRN || !hasScreeningEncounter,
        }}
      />
      {!hasMRN && <p className={styles.patientName}>{MRN_NULL_WARNING}</p>}
      {!hasScreeningEncounter && (
        <p className={styles.patientName}>{formWarning("PEP Registration")}</p>
      )}
      {isConfirmedPositive && (
        <p className={styles.patientName}>{POSITIVE_PATIENT_WARNING}</p>
      )}
    </>
  );
};

export default PostExposureFollowup;
