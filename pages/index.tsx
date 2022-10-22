import {
  useClaimedNFTSupply,
  useContractMetadata,
  useUnclaimedNFTSupply,
  useActiveClaimCondition,
  useAddress,
  Web3Button,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import type { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Theme.module.css";
import Image from "next/image";

// Put Your NFT Drop Contract address from the dashboard here
const myNftDropContractAddress = "0x1aA146c9f24F7d2a6349f935EC3DA3268c8eB199";

const Home: NextPage = () => {
  const { contract: nftDrop } = useContract(myNftDropContractAddress);
  const address = useAddress();
  const { data: userBalance } = useContractRead(nftDrop, "balanceOf", address);

  // The amount the user claims
  const [quantity] = useState(1);

  // Load contract metadata
  const { data: contractMetadata } = useContractMetadata(nftDrop);

  // Load claimed supply and unclaimed supply
  const { data: unclaimedSupply } = useUnclaimedNFTSupply(nftDrop);
  const { data: claimedSupply } = useClaimedNFTSupply(nftDrop);

  // Load the active claim condition
  const { data: activeClaimCondition } = useActiveClaimCondition(nftDrop);

  // Check if there's NFTs left on the active claim phase
  const isNotReady =
    activeClaimCondition &&
    parseInt(activeClaimCondition?.availableSupply) === 0;

  // Check if there's any NFTs left
  const isSoldOut = unclaimedSupply?.toNumber() === 0;

  // Check price
  const price = parseUnits(
    activeClaimCondition?.currencyMetadata.displayValue || "0",
    activeClaimCondition?.currencyMetadata.decimals
  );

  // Multiply depending on quantity
  const priceToMint = price.mul(quantity);

  // Loading state while we fetch the metadata
  if (!nftDrop || !contractMetadata) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mintInfoContainer}>
        <div className={styles.imageSide}>
          {/* Title of your NFT Collection */}
          <h1>{"Genesis Map"}</h1>
          {/* Description of your NFT Collection */}
          <p className={styles.description}>
            {
              "The Genesis Map gives holders lifetime citizenship to the Offshore DAO."
            }
          </p>

          {/* Image Preview of NFTs */}
          <Image
            width={300}
            height={300}
            className={styles.image}
            src={`/offshore-genesis-map.gif`} 
            alt={`${contractMetadata?.name} preview image`}
          />

          {/* Amount claimed so far */}
          <div className={styles.mintCompletionArea}>
            <div className={styles.mintAreaLeft}>
              <p>Total Minted</p>
            </div>
            <div className={styles.mintAreaRight}>
              {claimedSupply && unclaimedSupply ? (
                <p>
                  {/* Claimed supply so far */}
                  <b>{claimedSupply?.toNumber()}</b>
                  {" / "}
                  {
                    // Add unclaimed and claimed supply to get the total supply
                    claimedSupply?.toNumber() + unclaimedSupply?.toNumber()
                  }
                </p>
              ) : (
                // Show loading state if we're still loading the supply
                <p>Loading...</p>
              )}
            </div>
          </div>

          {/* Show claim button or connect wallet button */}
          {
            // Sold out or show the claim button
            isSoldOut ? (
              <div>
                <h2>Sold Out</h2>
              </div>
            ) : isNotReady ? (
              <div>
                <h2>Not ready to be minted yet</h2>
              </div>
            ) : (
              <>
                <div className={styles.mintContainer}>
                  <Web3Button
                    contractAddress={myNftDropContractAddress}
                    isDisabled={userBalance?.toNumber() === 1}
                    action={async (contract) =>
                      await contract.erc721.claim(quantity)
                    }
                    // If the function is successful, we can do something here.
                    onSuccess={(result) =>
                      alert(
                        `Successfully minted ${result.length} Genesis Map NFT${
                          result.length > 1 ? "s" : ""
                        }!`
                      )
                    }
                    // If the function fails, we can do something here.
                    onError={(error) => alert(error?.message)}
                    accentColor="#f213a4"
                    colorMode="dark"
                  >
                    {`Mint${quantity > 1 ? ` ${quantity}` : ""}${
                      activeClaimCondition?.price.eq(0)
                        ? ""
                        : activeClaimCondition?.currencyMetadata.displayValue
                        ? ` (${formatUnits(
                            priceToMint,
                            activeClaimCondition.currencyMetadata.decimals
                          )} ${activeClaimCondition?.currencyMetadata.symbol})`
                        : ""
                    }`}
                  </Web3Button>
                </div>

                {userBalance?.toNumber() === 1 && (
                  <div>
                    <h4>Congratulations, you now hold the map 🏝️.</h4>
                  </div>
                )}
              </>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Home;
