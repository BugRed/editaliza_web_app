import { supabase } from "@/app/lib/supabase";
import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async () => {
  try {
    const { data: userData, error: userError } = await supabase.from('user_data').select('*');
    if (userError) throw userError;

    const { data: artists, error: artistError } = await supabase.from('artists').select('*');
    if (artistError) throw artistError;
    
    const { data: proposers, error: proposerError } = await supabase.from('proposers').select('*');
    if (proposerError) throw proposerError;

    const { data: editals, error: editalError } = await supabase.from('editals').select('*');
    if (editalError) throw editalError;

    const { data: tags, error: tagError } = await supabase.from('tags').select('*');
    if (tagError) throw tagError;

    // Retorna os dados como props
    return {
      props: {
        userData,
        artists,
        proposers,
        editals,
        tags,
        error: null,
      },
    };
  } catch (err: any) {
    // Retorna o erro se algo der errado
    return {
      props: {
        userData: [],
        artists: [],
        proposers: [],
        editals: [],
        tags: [],
        error: err.message,
      },
    };
  }
};