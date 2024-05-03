import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const owner = 0x71fd78c0;

const LockModule = buildModule("MovieModule", (m) => {
  const initOwner = m.getParameter("initialOwner", owner);

  const lock = m.contract("Lock", [initOwner], {
  });

  return { lock };
});

export default LockModule;
